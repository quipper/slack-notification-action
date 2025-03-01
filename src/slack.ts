import { KnownBlock, MrkdwnElement, SectionBlock } from '@slack/web-api'
import { FailedJob, WorkflowRunSummary } from './workflow-run.js'

type Context = {
  repository: string
  actor: string
  currentJobStatus: string
}

export type Templates = {
  lostCommunicationErrorMessage: string
  shutdownSignalErrorMessage: string
  mentionMessage: string
}

export const getSlackBlocks = (w: WorkflowRunSummary, c: Context, templates: Templates): KnownBlock[] => {
  // When the current workflow run is still running, use the current job status.
  const conclusion = w.conclusion ?? c.currentJobStatus
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Workflow *<${w.workflowRunUrl}|${w.workflowName}>* ${conclusion.toLocaleLowerCase()}`,
      },
    },
    ...getFailedJobBlocks(w, templates),
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `:github: ${c.repository}/*${w.branch}*`,
        },
        ...getPullRequestBlock(w),
        ...getMentionBlock(w, templates),
      ],
    },
  ]
}

const getFailedJobBlocks = (w: WorkflowRunSummary, templates: Templates): SectionBlock[] =>
  w.failedJobs.map((failedJob) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: [`Job *${failedJob.name}*`, ...getFailedJobCause(failedJob, templates)].join('\n'),
    },
  }))

export const getFailedJobCause = (failedJob: FailedJob, templates: Templates): string[] => {
  for (const m of failedJob.failureAnnotationMessages) {
    if (m.match(/The self-hosted runner: .+? lost communication with the server/)) {
      return [templates.lostCommunicationErrorMessage]
    }
    if (m.match(/^The runner has received a shutdown signal./)) {
      return [templates.shutdownSignalErrorMessage]
    }
  }

  const failureMessages = []
  failureMessages.push(...failedJob.failureStepNames)
  failureMessages.push(
    ...failedJob.failureAnnotationMessages.map((message) => {
      if (message.length > 300) {
        return message.substring(0, 300) + '...'
      }
      return message
    }),
  )
  if (failureMessages.length > 0) {
    return ['```', ...failureMessages, '```']
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

const getMentionBlock = (w: WorkflowRunSummary, templates: Templates): MrkdwnElement[] => {
  if (w.event === 'schedule') {
    // For a scheduled event, github.actor is the last committer. Do not mention it.
    return []
  }
  if (templates.mentionMessage === '') {
    return []
  }
  return [
    {
      type: 'mrkdwn',
      text: templates.mentionMessage,
    },
  ]
}
