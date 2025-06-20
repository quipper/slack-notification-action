import assert from 'assert'
import { GetWorkflowRunQuery } from './generated/graphql.js'
import { CheckAnnotationLevel, CheckConclusionState } from './generated/graphql-types.js'

export type WorkflowRunSummary = {
  workflowName: string
  workflowRunUrl: string
  event: string
  branch: string | undefined
  conclusion: CheckConclusionState | null | undefined
  failedJobs: FailedJob[]
  associatedPullRequest: AssociatedPullRequest | undefined
}

export type FailedJob = {
  name: string
  failureStepNames: string[]
  failureAnnotations: Annotation[]
}

export type Annotation = {
  message: string
  path: string
}

type AssociatedPullRequest = {
  number: number
  url: string
  title: string
}

export const getWorkflowRunSummary = (workflowRun: GetWorkflowRunQuery): WorkflowRunSummary => {
  assert(workflowRun.node != null, `workflowRun.node must not be null`)
  assert.strictEqual(workflowRun.node.__typename, 'WorkflowRun')
  const checkSuite = workflowRun.node.checkSuite

  const failedJobs: FailedJob[] = []
  for (const checkRun of checkSuite.failedCheckRuns?.nodes ?? []) {
    assert(checkRun != null, `checkRun must not be null`)
    const failureStepNames = new Set<string>()
    for (const step of checkRun.steps?.nodes ?? []) {
      if (step?.conclusion === CheckConclusionState.Failure) {
        failureStepNames.add(step.name)
      }
    }
    const failureAnnotations = []
    for (const annotation of checkRun.annotations?.nodes ?? []) {
      if (annotation?.message && annotation.annotationLevel === CheckAnnotationLevel.Failure) {
        failureAnnotations.push({
          message: annotation.message,
          path: annotation.path,
        })
      }
    }
    failedJobs.push({
      name: checkRun.name,
      failureStepNames: [...failureStepNames],
      failureAnnotations,
    })
  }

  return {
    workflowName: workflowRun.node.workflow.name,
    workflowRunUrl: workflowRun.node.url,
    event: workflowRun.node.event,
    branch: checkSuite.branch?.name,
    conclusion: checkSuite.conclusion,
    failedJobs,
    associatedPullRequest: getAssociatedPullRequest(workflowRun),
  }
}

const getAssociatedPullRequest = (workflowRun: GetWorkflowRunQuery): AssociatedPullRequest | undefined => {
  assert(workflowRun.node != null, `workflowRun.node must not be null`)
  assert.strictEqual(workflowRun.node.__typename, 'WorkflowRun')
  const associatedPullRequests = workflowRun.node.checkSuite.commit.associatedPullRequests
  assert(associatedPullRequests != null, `associatedPullRequests must not be null`)
  assert(associatedPullRequests.nodes != null, `associatedPullRequests.nodes must not be null`)
  if (associatedPullRequests.nodes.length === 0) {
    return
  }
  const pull = associatedPullRequests.nodes[0]
  assert(pull != null, `pull must not be null`)
  return {
    number: pull.number,
    url: pull.url,
    title: pull.title,
  }
}
