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
        event: 'push',
        checkSuite: {
          conclusion: CheckConclusionState.Failure,
          branch: {
            name: 'main',
          },
          failedCheckRuns: {
            nodes: [
              {
                name: 'jest',
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
                  title: 'Example',
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
      event: 'push',
      branch: 'main',
      conclusion: CheckConclusionState.Failure,
      failedJobs: [
        {
          name: 'jest',
          failureAnnotationMessages: ['this is an example'],
        },
      ],
      associatedPullRequest: {
        number: 484,
        url: 'https://github.com/int128/workflow-run-summary-action/pull/484',
        title: 'Example',
      },
    })
  })

  test('no failed jobs or associated pulls', () => {
    // https://github.com/int128/sandbox/actions/runs/5862603103/job/15894663930
    // {"id": "CS_kwDOBCmOrs8AAAADg69rsw"}
    const outputs = getWorkflowRunSummary({
      node: {
        __typename: 'WorkflowRun',
        url: 'https://github.com/int128/workflow-run-summary-action/actions/runs/5861542956',
        workflow: {
          name: 'test',
        },
        event: 'push',
        checkSuite: {
          failedCheckRuns: {
            nodes: [],
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
      event: 'push',
      branch: undefined,
      conclusion: undefined,
      failedJobs: [],
      associatedPullRequest: undefined,
    })
  })
})
