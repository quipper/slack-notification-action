import { describe, expect, it } from 'vitest'
import { getFailedJobCause } from '../src/slack.js'
import { FailedJob } from '../src/workflow-run.js'

describe('getFailedJobCause', () => {
  it('returns empty array when the messages are empty', () => {
    const failedJob: FailedJob = {
      name: 'job',
      failureStepNames: [],
      failureAnnotationMessages: [],
    }
    const cause = getFailedJobCause(failedJob)
    expect(cause).toStrictEqual([])
  })

  it('returns the messages', () => {
    const failedJob: FailedJob = {
      name: 'job',
      failureStepNames: ['Run make'],
      failureAnnotationMessages: ['message1', 'message2'],
    }
    const cause = getFailedJobCause(failedJob)
    expect(cause).toStrictEqual(['```', 'Run make', 'message1', 'message2', '```'])
  })
})
