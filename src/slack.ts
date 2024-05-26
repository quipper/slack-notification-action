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
        text: `Workflow ${w.conclusion?.toLocaleLowerCase() ?? ''} <${w.workflowRunUrl}|${w.workflowName}>`,
      },
    },
  ]

  if (w.annotationFailureMessages !== '') {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Failed annotations:\n${w.annotationFailureMessages}`,
      },
    })
  }

  const contextBlock: ContextBlock = {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `${c.repository}/*${w.branch}*`,
      },
    ],
  }
  if (w.associatedPullRequest) {
    contextBlock.elements.push({
      type: 'mrkdwn',
      text: `<${w.associatedPullRequest.url}|#${w.associatedPullRequest.number}>`,
    })
  }
  contextBlock.elements.push({
    type: 'mrkdwn',
    text: `@${c.actor}`,
  })
  blocks.push(contextBlock)
  return blocks
}
