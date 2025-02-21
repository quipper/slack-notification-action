import assert from 'assert'
import * as webhook from '@octokit/webhooks-types'
import { Octokit } from '@octokit/action'

export const getOctokit = () => new Octokit()

export type Context = {
  runId: number
  eventName: string
  payload: webhook.WebhookEvent
  actor: string
  repo: {
    owner: string
    repo: string
  }
}

export const getContext = (): Context => {
  assert(process.env.GITHUB_REPOSITORY, 'GITHUB_REPOSITORY is required')
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
  assert(process.env.GITHUB_RUN_ID, 'GITHUB_RUN_ID is required')
  assert(process.env.GITHUB_EVENT_NAME, 'GITHUB_EVENT_NAME is required')
  assert(process.env.GITHUB_EVENT_PATH, 'GITHUB_EVENT_PATH is required')
  assert(process.env.GITHUB_ACTOR, 'GITHUB_ACTOR is required')
  return {
    repo: { owner, repo },
    runId: Number(process.env.GITHUB_RUN_ID),
    eventName: process.env.GITHUB_EVENT_NAME,
    payload: JSON.parse(process.env.GITHUB_EVENT_PATH) as webhook.WebhookEvent,
    actor: process.env.GITHUB_ACTOR,
  }
}
