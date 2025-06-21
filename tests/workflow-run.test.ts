import { describe, expect, test } from 'vitest'
import { CheckAnnotationLevel, CheckConclusionState } from '../src/generated/graphql-types.js'
import { getWorkflowRunSummary, WorkflowRunSummary } from '../src/workflow-run.js'

describe('getWorkflowRunSummary', () => {
  test('full fields', () => {
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
                steps: {
                  nodes: [
                    {
                      name: 'Set up job',
                      conclusion: CheckConclusionState.Success,
                    },
                    {
                      name: 'Run actions/checkout@v4',
                      conclusion: CheckConclusionState.Success,
                    },
                    {
                      name: 'Run make',
                      conclusion: CheckConclusionState.Failure,
                    },
                    {
                      name: 'Post Run actions/checkout@v4',
                      conclusion: CheckConclusionState.Success,
                    },
                    {
                      name: 'Complete job',
                      conclusion: CheckConclusionState.Success,
                    },
                  ],
                },
                annotations: {
                  nodes: [
                    {
                      message: 'this is an example',
                      annotationLevel: CheckAnnotationLevel.Failure,
                      path: 'src/index.ts',
                    },
                  ],
                },
              },
            ],
          },
          commit: {
            oid: '1234567890abcdef1234567890abcdef12345678',
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
      sha: '1234567890abcdef1234567890abcdef12345678',
      conclusion: CheckConclusionState.Failure,
      failedJobs: [
        {
          name: 'jest',
          failureStepNames: ['Run make'],
          failureAnnotations: [
            {
              message: 'this is an example',
              path: 'src/index.ts',
            },
          ],
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
            oid: '1234567890abcdef1234567890abcdef12345678',
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
      sha: '1234567890abcdef1234567890abcdef12345678',
      conclusion: undefined,
      failedJobs: [],
      associatedPullRequest: undefined,
    })
  })
})
