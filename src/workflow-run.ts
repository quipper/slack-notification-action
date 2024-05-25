import assert from 'assert'
import { CheckSuiteQuery } from './generated/graphql.js'
import { CheckAnnotationLevel, CheckConclusionState } from './generated/graphql-types.js'

export const getWorkflowRunSummary = (checkSuite: CheckSuiteQuery) => {
  assert(checkSuite.node != null)
  assert.strictEqual(checkSuite.node.__typename, 'CheckSuite')

  const annotationMessages = new Set<string>()
  const annotationFailureMessages = new Set<string>()
  const conclusions = new Array<CheckConclusionState>()
  for (const checkRun of checkSuite.node.checkRuns?.nodes ?? []) {
    if (checkRun == null) {
      continue
    }
    if (checkRun.conclusion) {
      conclusions.push(checkRun.conclusion)
    }
    for (const annotation of checkRun.annotations?.nodes ?? []) {
      if (annotation?.message) {
        annotationMessages.add(annotation.message)
        if (annotation.annotationLevel === CheckAnnotationLevel.Failure) {
          annotationFailureMessages.add(annotation.message)
        }
      }
    }
  }

  let associatedPullRequest
  assert(checkSuite.node.commit.associatedPullRequests != null)
  assert(checkSuite.node.commit.associatedPullRequests.nodes != null)
  if (checkSuite.node.commit.associatedPullRequests.nodes.length > 0) {
    const pull = checkSuite.node.commit.associatedPullRequests.nodes[0]
    assert(pull != null)
    associatedPullRequest = {
      number: pull.number,
      url: pull.url,
    }
  }

  return {
    annotationMessages: [...annotationMessages].join('\n'),
    annotationFailureMessages: [...annotationFailureMessages].join('\n'),
    cancelled: conclusions.some((c) => c === CheckConclusionState.Cancelled),
    skipped: conclusions.every((c) => c === CheckConclusionState.Skipped),
    associatedPullRequest,
  }
}
