import * as core from '@actions/core'
import * as github from './github.js'
import * as slack from '@slack/web-api'
import { Octokit } from '@octokit/action'
import { getSlackBlocks, Templates } from './slack.js'
import { getWorkflowRun } from './queries/workflow-run.js'
import { getWorkflowRunSummary, WorkflowRunSummary } from './workflow-run.js'
import { CheckConclusionState } from './generated/graphql-types.js'

type Inputs = {
  slackChannelId: string
  slackAppToken: string
  githubCurrentJobStatus: string
} & Templates

export const run = async (inputs: Inputs, octokit: Octokit, context: github.Context): Promise<void> => {
  const workflowRun = await getWorkflowRunForEvent(octokit, context)
  const summary = getWorkflowRunSummary(workflowRun)
  core.startGroup(`WorkflowRunSummary`)
  core.info(JSON.stringify(summary, undefined, 2))
  core.endGroup()

  if (summary.failedJobs.length > 0) {
    core.info(`Found ${summary.failedJobs.length} failed jobs`)
    return await send(summary, inputs, context)
  }
  if (inputs.githubCurrentJobStatus === 'failure') {
    core.info('The current job is failing')
    return await send(summary, inputs, context)
  }
  switch (summary.conclusion) {
    case CheckConclusionState.Success:
    case CheckConclusionState.TimedOut:
    case CheckConclusionState.ActionRequired:
    case CheckConclusionState.StartupFailure:
      return await send(summary, inputs, context)
  }
  core.info('Nothing sent')
}

const send = async (summary: WorkflowRunSummary, inputs: Inputs, context: github.Context) => {
  const blocks = getSlackBlocks(
    summary,
    {
      repo: context.repo,
      actor: context.actor,
      serverUrl: context.serverUrl,
      currentJobStatus: inputs.githubCurrentJobStatus,
    },
    inputs,
  )
  core.info(`Sending the message: ${JSON.stringify(blocks, undefined, 2)}`)

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

const getWorkflowRunForEvent = async (octokit: Octokit, context: github.Context) => {
  if ('workflow_run' in context.payload && context.payload.workflow_run != null) {
    core.info(`Getting the target workflow run ${context.payload.workflow_run.node_id}`)
    return await getWorkflowRun(octokit, { id: context.payload.workflow_run.node_id })
  }

  core.info(`Getting the current workflow run ${context.runId}`)
  const { data: workflowRun } = await octokit.rest.actions.getWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: context.runId,
  })
  core.info(`Getting the workflow run ${workflowRun.node_id}`)
  return await getWorkflowRun(octokit, { id: workflowRun.node_id })
}
