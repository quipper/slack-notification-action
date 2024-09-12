import * as core from '@actions/core'
import * as github from '@actions/github'
import * as slack from '@slack/web-api'
import * as webhook from '@octokit/webhooks-types'
import { getSlackBlocks, Templates } from './slack.js'
import { getWorkflowRun } from './queries/workflow-run.js'
import { getWorkflowRunSummary, WorkflowRunSummary } from './workflow-run.js'
import { CheckConclusionState } from './generated/graphql-types.js'

type Octokit = ReturnType<typeof github.getOctokit>

type Inputs = {
  slackChannelId: string
  slackAppToken: string
  githubToken: string
  githubCurrentJobStatus: string
} & Templates

export const run = async (inputs: Inputs): Promise<void> => {
  const octokit = github.getOctokit(inputs.githubToken)
  const workflowRun = await getWorkflowRunForEvent(octokit)
  const summary = getWorkflowRunSummary(workflowRun)
  core.startGroup(`WorkflowRunSummary`)
  core.info(JSON.stringify(summary, undefined, 2))
  core.endGroup()

  if (summary.failedJobs.length > 0) {
    core.info(`Found ${summary.failedJobs.length} failed jobs`)
    return await send(summary, inputs)
  }
  if (inputs.githubCurrentJobStatus === 'failure') {
    core.info('The current job is failing')
    return await send(summary, inputs)
  }
  switch (summary.conclusion) {
    case CheckConclusionState.Success:
    case CheckConclusionState.TimedOut:
    case CheckConclusionState.ActionRequired:
    case CheckConclusionState.StartupFailure:
      return await send(summary, inputs)
  }
  core.info('Nothing sent')
}

const send = async (summary: WorkflowRunSummary, inputs: Inputs) => {
  const blocks = getSlackBlocks(
    summary,
    {
      repository: github.context.repo.repo,
      actor: github.context.actor,
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

const getWorkflowRunForEvent = async (octokit: Octokit) => {
  if (github.context.eventName === 'workflow_run') {
    const payload = github.context.payload as webhook.WorkflowRunEvent
    core.info(`Getting the target workflow run ${payload.workflow_run.node_id}`)
    return await getWorkflowRun(octokit, { id: payload.workflow_run.node_id })
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
