import type { KnownBlock, MrkdwnElement, SectionBlock } from '@slack/web-api'
import type { FailedJob, WorkflowRunSummary } from './workflow-run.js'

type Context = {
  repo: {
    owner: string
    repo: string
  }
  actor: string
  serverUrl: string
  currentJobStatus: string
}

export type Templates = {
  mentionMessage?: string
}

export const getSlackBlocks = (w: WorkflowRunSummary, context: Context, templates: Templates): KnownBlock[] => {
  // When the current workflow run is still running, use the current job status.
  const conclusion = w.conclusion ?? context.currentJobStatus
  const blobUrl = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/blob/${w.sha}`
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Workflow *<${w.workflowRunUrl}|${w.workflowName}>* ${conclusion.toLocaleLowerCase()}`,
      },
    },
    ...getFailedJobBlocks(w, blobUrl),
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `:github: ${context.repo.repo}/*${w.branch}*`,
        },
        ...getPullRequestBlock(w),
        ...getMentionBlock(w, templates),
      ],
    },
  ]
}

const getFailedJobBlocks = (w: WorkflowRunSummary, blobUrl: string): SectionBlock[] =>
  w.failedJobs.map((failedJob) => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: [`Job *${failedJob.name}*`, ...getFailedJobCause(failedJob, blobUrl)].join('\n'),
    },
  }))

export const getFailedJobCause = (failedJob: FailedJob, blobUrl: string): string[] => {
  const withoutPath = [...failedJob.failureStepNames]
  const byPath = new Map<string, string[]>()

  for (const annotation of failedJob.failureAnnotations) {
    if (!annotation.path || annotation.path === '.github') {
      withoutPath.push(trimMessage(annotation.message, 300))
    } else {
      const messages = byPath.get(annotation.path) ?? []
      messages.push(trimMessage(annotation.message, 300))
      byPath.set(annotation.path, messages)
    }
  }

  if (withoutPath.length > 0) {
    withoutPath.unshift('```')
    withoutPath.push('```')
  }

  const withPath = []
  for (const [path, pathMessages] of byPath.entries()) {
    withPath.push(`<${blobUrl}/${path}|${path}>`)
    withPath.push('```')
    withPath.push(...pathMessages)
    withPath.push('```')
  }
  return [...withoutPath, ...withPath]
}

const trimMessage = (message: string, maxLength: number): string => {
  if (message.length > maxLength) {
    return `${message.substring(0, maxLength)}...`
  }
  return message
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
  if (!templates.mentionMessage) {
    return []
  }
  return [
    {
      type: 'mrkdwn',
      text: templates.mentionMessage,
    },
  ]
}
