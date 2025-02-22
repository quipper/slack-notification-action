import assert from 'assert'
import * as fs from 'fs/promises'
import * as webhook from '@octokit/webhooks-types'
import { Octokit } from '@octokit/action'

export const getOctokit = (token: string) => new Octokit({ auth: token, authStrategy: null })

export type Context = {
  repo: {
    owner: string
    repo: string
  }
  actor: string
  eventName: string
  payload: webhook.WebhookEvent
  runId: number
}

export const getContext = async (): Promise<Context> => {
  // https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables
  assert(process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY is required')
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

  assert(process.env.GITHUB_ACTOR, 'GITHUB_ACTOR is required')
  assert(process.env.GITHUB_EVENT_NAME, 'GITHUB_EVENT_NAME is required')
  assert(process.env.GITHUB_RUN_ID, 'GITHUB_RUN_ID is required')

  assert(process.env.GITHUB_EVENT_PATH, 'GITHUB_EVENT_PATH is required')
  const payload = JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH, 'utf-8')) as webhook.WebhookEvent

  return {
    repo: { owner, repo },
    actor: process.env.GITHUB_ACTOR,
    eventName: process.env.GITHUB_EVENT_NAME,
    payload,
    runId: Number.parseInt(process.env.GITHUB_RUN_ID),
  }
}
