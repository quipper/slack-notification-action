import { ContextBlock, KnownBlock } from '@slack/web-api'
import { WorkflowRunSummary } from './workflow-run.js'

type Context = {
  repository: string
  actor: string
}

export const getSlackBlocks = (w: WorkflowRunSummary, c: Context): KnownBlock[] => {
  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Workflow **<${w.workflowRunUrl}|${w.workflowName}>** ${w.conclusion?.toLocaleLowerCase() ?? ''}`,
      },
    },
  ]

  for (const failedJob of w.failedJobs) {
    const lines = [`Job **${failedJob.name}**`]
    if (failedJob.failureAnnotationMessages.length > 0) {
      lines.push('```', ...failedJob.failureAnnotationMessages, '```')
    }
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: lines.join('\n'),
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
    ],
  }
  if (w.associatedPullRequest) {
    contextBlock.elements.push({
      type: 'mrkdwn',
      text: `:pr_merged: <${w.associatedPullRequest.url}|#${w.associatedPullRequest.number}>`,
    })
  }
  contextBlock.elements.push({
    type: 'mrkdwn',
    text: `:bust_in_silhouette: @${c.actor}`,
  })
  blocks.push(contextBlock)
  return blocks
}
