import * as github from '@actions/github'
import { GetWorkflowRunQuery, GetWorkflowRunQueryVariables } from '../generated/graphql.js'

type Octokit = ReturnType<typeof github.getOctokit>

const query = /* GraphQL */ `
  query getWorkflowRun($id: ID!) {
    node(id: $id) {
      __typename
      ... on WorkflowRun {
        checkSuite {
          checkRuns(first: 100) {
            nodes {
              conclusion
              annotations(first: 10) {
                nodes {
                  message
                  annotationLevel
                }
              }
            }
          }
          commit {
            associatedPullRequests(first: 1) {
              totalCount
              nodes {
                number
                url
              }
            }
          }
        }
      }
    }
  }
`

export const getWorkflowRun = async (o: Octokit, v: GetWorkflowRunQueryVariables): Promise<GetWorkflowRunQuery> =>
  await o.graphql(query, v)
