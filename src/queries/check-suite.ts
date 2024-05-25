import * as github from '@actions/github'
import { CheckSuiteQuery, CheckSuiteQueryVariables } from '../generated/graphql.js'

type Octokit = ReturnType<typeof github.getOctokit>

const query = /* GraphQL */ `
  query checkSuite($id: ID!) {
    node(id: $id) {
      __typename
      ... on CheckSuite {
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
`

export const getCheckSuite = async (o: Octokit, v: CheckSuiteQueryVariables): Promise<CheckSuiteQuery> =>
  await o.graphql(query, v)
