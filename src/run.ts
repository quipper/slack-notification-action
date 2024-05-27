import assert from 'assert'
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as slack from '@slack/web-api'
import { getSlackBlocks } from './slack.js'
import { getWorkflowRun } from './queries/workflow-run.js'
import { getWorkflowRunSummary } from './workflow-run.js'

type Octokit = ReturnType<typeof github.getOctokit>

type Inputs = {
  slackChannelId: string
  slackAppToken: string
  githubToken: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const octokit = github.getOctokit(inputs.githubToken)
  const workflowRun = await getWorkflowRunForEvent(octokit)

  const summary = getWorkflowRunSummary(workflowRun)
  if (summary.cancelled) {
    core.info('This workflow run is cancelled. Do nothing.')
    return
  }
  if (summary.skipped) {
    core.info('This workflow run is skipped. Do nothing.')
    return
  }

  const blocks = getSlackBlocks(summary, {
    repository: github.context.repo.repo,
    actor: github.context.actor,
  })
  core.info(`Sending blocks: ${JSON.stringify(blocks, undefined, 2)}`)

  if (inputs.slackAppToken === '') {
    core.warning('slack-app-token is not set. Skip sending the message to Slack.')
    return
  }
  const slackClient = new slack.WebClient(inputs.slackAppToken)
  await slackClient.chat.postMessage({
    channel: inputs.slackChannelId,
    blocks,
  })
  core.info('Sent the message to Slack')
}

const getWorkflowRunForEvent = async (octokit: Octokit) => {
  if (github.context.eventName === 'workflow_run') {
    const workflowRun: unknown = github.context.payload.workflow_run
    assert(typeof workflowRun === 'object')
    assert(workflowRun !== null)
    assert('node_id' in workflowRun)
    assert(typeof workflowRun.node_id === 'string')
    core.info(`Getting the target workflow run ${workflowRun.node_id}`)
    return await getWorkflowRun(octokit, { id: workflowRun.node_id })
  }

  core.info(`Getting the current workflow run ${github.context.runId}`)
  const { data: workflowRun } = await octokit.rest.actions.getWorkflowRun({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    run_id: github.context.runId,
  })
  core.info(`Getting the workflow run ${workflowRun.node_id}`)
  return await getWorkflowRun(octokit, { id: workflowRun.node_id })
}
