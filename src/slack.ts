import { ContextBlock, KnownBlock, MrkdwnElement } from '@slack/web-api'
import { FailedJob, WorkflowRunSummary } from './workflow-run.js'

type Context = {
  repository: string
  actor: string
}

export type Templates = {
  lostCommunicationErrorMessage: string
}

export const getSlackBlocks = (w: WorkflowRunSummary, c: Context, templates: Templates): KnownBlock[] => {
  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Workflow *<${w.workflowRunUrl}|${w.workflowName}>* ${w.conclusion?.toLocaleLowerCase() ?? ''}`,
      },
    },
  ]

  for (const failedJob of w.failedJobs) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: [`Job *${failedJob.name}*`, ...getFailedJobCause(failedJob, templates)].join('\n'),
      },
    })
  }

  const contextBlock: ContextBlock = {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `:github: ${c.repository}/*${w.branch}*`,
      },
      ...getPullRequestBlock(w),
      ...getMentionBlock(w, c),
    ],
  }
  blocks.push(contextBlock)
  return blocks
}

export const getFailedJobCause = (failedJob: FailedJob, templates: Templates): string[] => {
  for (const m of failedJob.failureAnnotationMessages) {
    if (m.match(/The self-hosted runner: .+? lost communication with the server/)) {
      return [templates.lostCommunicationErrorMessage]
    }
  }

  if (failedJob.failureAnnotationMessages.length > 0) {
    return ['```', ...failedJob.failureAnnotationMessages, '```']
  }
  return []
}

const getPullRequestBlock = (w: WorkflowRunSummary): MrkdwnElement[] => {
  if (!w.associatedPullRequest) {
    return []
  }
  if (w.event === 'schedule') {
    // For a scheduled event, do not show the last commit.
    return []
  }
  return [
    {
      type: 'mrkdwn',
      text: `:pr_merged: <${w.associatedPullRequest.url}|#${w.associatedPullRequest.number}> ${w.associatedPullRequest.title}`,
    },
  ]
}

const getMentionBlock = (w: WorkflowRunSummary, c: Context): MrkdwnElement[] => {
  if (w.event === 'schedule') {
    // For a scheduled event, github.actor is the last committer. Do not mention it.
    return []
  }
  return [
    {
      type: 'mrkdwn',
      text: `@${c.actor}`,
    },
  ]
}
