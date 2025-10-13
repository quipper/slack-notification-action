import { describe, expect, it } from 'vitest'
import { getFailedJobCause } from '../src/slack.js'
import type { FailedJob } from '../src/workflow-run.js'

describe('getFailedJobCause', () => {
  it('returns empty array when the messages are empty', () => {
    const failedJob: FailedJob = {
      name: 'job',
      failureStepNames: [],
      failureAnnotations: [],
    }
    const cause = getFailedJobCause(
      failedJob,
      'https://github.com/quipper/slack-notification-action/blob/1234567890abcdef1234567890abcdef12345678',
    )
    expect(cause).toStrictEqual([])
  })

  it('returns the messages', () => {
    const failedJob: FailedJob = {
      name: 'job',
      failureStepNames: ['Run make'],
      failureAnnotations: [
        { message: 'message1', path: '' },
        { message: 'message2', path: 'src/index.ts' },
      ],
    }
    const cause = getFailedJobCause(
      failedJob,
      'https://github.com/quipper/slack-notification-action/blob/1234567890abcdef1234567890abcdef12345678',
    )
    expect(cause).toStrictEqual([
      '```',
      'Run make',
      'message1',
      '```',
      '<https://github.com/quipper/slack-notification-action/blob/1234567890abcdef1234567890abcdef12345678/src/index.ts|src/index.ts>',
      '```',
      'message2',
      '```',
    ])
  })
})
