import assert from 'assert'
import { GetWorkflowRunQuery } from './generated/graphql.js'
import { CheckAnnotationLevel, CheckConclusionState } from './generated/graphql-types.js'

export type WorkflowRunSummary = {
  workflowName: string
  workflowRunUrl: string
  conclusion: CheckConclusionState | null | undefined
  branch: string | undefined
  annotationFailureMessages: string
  cancelled: boolean
  skipped: boolean
  associatedPullRequest: AssociatedPullRequest | undefined
}

type AssociatedPullRequest = {
  number: number
  url: string
}

export const getWorkflowRunSummary = (workflowRun: GetWorkflowRunQuery): WorkflowRunSummary => {
  assert(workflowRun.node != null)
  assert(workflowRun.node.__typename === 'WorkflowRun')
  const checkSuite = workflowRun.node.checkSuite

  const annotationFailureMessages = new Set<string>()
  const conclusions = new Array<CheckConclusionState>()
  for (const checkRun of checkSuite.checkRuns?.nodes ?? []) {
    if (checkRun == null) {
      continue
    }
    if (checkRun.conclusion) {
      conclusions.push(checkRun.conclusion)
    }
    for (const annotation of checkRun.annotations?.nodes ?? []) {
      if (annotation?.message) {
        if (annotation.annotationLevel === CheckAnnotationLevel.Failure) {
          annotationFailureMessages.add(annotation.message)
        }
      }
    }
  }

  let associatedPullRequest
  assert(checkSuite.commit.associatedPullRequests != null)
  assert(checkSuite.commit.associatedPullRequests.nodes != null)
  if (checkSuite.commit.associatedPullRequests.nodes.length > 0) {
    const pull = checkSuite.commit.associatedPullRequests.nodes[0]
    assert(pull != null)
    associatedPullRequest = {
      number: pull.number,
      url: pull.url,
    }
  }

  return {
    workflowName: workflowRun.node.workflow.name,
    workflowRunUrl: workflowRun.node.url,
    conclusion: checkSuite.conclusion,
    branch: checkSuite.branch?.name,
    annotationFailureMessages: [...annotationFailureMessages].join('\n'),
    cancelled: conclusions.some((c) => c === CheckConclusionState.Cancelled),
    skipped: conclusions.every((c) => c === CheckConclusionState.Skipped),
    associatedPullRequest,
  }
}
