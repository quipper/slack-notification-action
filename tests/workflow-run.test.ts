import { CheckAnnotationLevel, CheckConclusionState } from '../src/generated/graphql-types.js'
import { getWorkflowRunSummary, WorkflowRunSummary } from '../src/workflow-run.js'

describe('getWorkflowRunSummary', () => {
  test('full fields', () => {
    // https://github.com/int128/workflow-run-summary-action/actions/runs/5861542956/job/15891810930
    // {"id": "CS_kwDOGSet3s8AAAADg4c9nQ"}
    const outputs = getWorkflowRunSummary({
      node: {
        __typename: 'WorkflowRun',
        url: 'https://github.com/int128/workflow-run-summary-action/actions/runs/5861542956',
        workflow: {
          name: 'test',
        },
        checkSuite: {
          conclusion: CheckConclusionState.Failure,
          branch: {
            name: 'main',
          },
          checkRuns: {
            nodes: [
              {
                conclusion: CheckConclusionState.Success,
                annotations: {
                  nodes: [
                    {
                      message: 'this is an example',
                      annotationLevel: CheckAnnotationLevel.Failure,
                    },
                  ],
                },
              },
            ],
          },
          commit: {
            associatedPullRequests: {
              totalCount: 1,
              nodes: [
                {
                  number: 484,
                  url: 'https://github.com/int128/workflow-run-summary-action/pull/484',
                },
              ],
            },
          },
        },
      },
    })
    expect(outputs).toStrictEqual<WorkflowRunSummary>({
      workflowName: 'test',
      workflowRunUrl: 'https://github.com/int128/workflow-run-summary-action/actions/runs/5861542956',
      branch: 'main',
      conclusion: CheckConclusionState.Failure,
      cancelled: false,
      skipped: false,
      failureAnnotationMessages: ['this is an example'],
      associatedPullRequest: {
        number: 484,
        url: 'https://github.com/int128/workflow-run-summary-action/pull/484',
      },
    })
  })

  test('no annotations or associated pulls', () => {
    // https://github.com/int128/sandbox/actions/runs/5862603103/job/15894663930
    // {"id": "CS_kwDOBCmOrs8AAAADg69rsw"}
    const outputs = getWorkflowRunSummary({
      node: {
        __typename: 'WorkflowRun',
        url: 'https://github.com/int128/workflow-run-summary-action/actions/runs/5861542956',
        workflow: {
          name: 'test',
        },
        checkSuite: {
          checkRuns: {
            nodes: [
              {
                conclusion: CheckConclusionState.Success,
                annotations: {
                  nodes: [],
                },
              },
            ],
          },
          commit: {
            associatedPullRequests: {
              totalCount: 0,
              nodes: [],
            },
          },
        },
      },
    })
    expect(outputs).toStrictEqual<WorkflowRunSummary>({
      workflowName: 'test',
      workflowRunUrl: 'https://github.com/int128/workflow-run-summary-action/actions/runs/5861542956',
      branch: undefined,
      conclusion: undefined,
      cancelled: false,
      skipped: false,
      failureAnnotationMessages: [],
      associatedPullRequest: undefined,
    })
  })
})
