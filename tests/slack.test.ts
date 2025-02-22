import { describe, expect, it } from 'vitest'
import { getFailedJobCause, Templates } from '../src/slack.js'
import { FailedJob } from '../src/workflow-run.js'

describe('getFailedJobCause', () => {
  const templates: Templates = {
    lostCommunicationErrorMessage: 'SORRY',
    shutdownSignalErrorMessage: 'BYE',
    mentionMessage: '@octocat',
  }

  it('returns lostCommunicationErrorMessage when the failureAnnotationMessages contain lost communication message', () => {
    const failedJob: FailedJob = {
      name: 'job',
      failureStepNames: [],
      failureAnnotationMessages: [
        'The self-hosted runner: example-vnvrd-runner-98tzt lost communication with the server. Verify the machine is running and has a healthy network connection. Anything in your workflow that terminates the runner process, starves it for CPU/Memory, or blocks its network access can cause this error.',
      ],
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual(['SORRY'])
  })

  it('returns shutdownSignalErrorMessage when the failureAnnotationMessages contain shutdown signal message', () => {
    const failedJob: FailedJob = {
      name: 'job',
      failureStepNames: [],
      failureAnnotationMessages: [
        'The runner has received a shutdown signal. This can happen when the runner service is stopped, or a manually started runner is canceled.',
      ],
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual(['BYE'])
  })

  it('returns empty array when the messages are empty', () => {
    const failedJob: FailedJob = {
      name: 'job',
      failureStepNames: [],
      failureAnnotationMessages: [],
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual([])
  })

  it('returns the messages', () => {
    const failedJob: FailedJob = {
      name: 'job',
      failureStepNames: ['Run make'],
      failureAnnotationMessages: ['message1', 'message2'],
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual(['```', 'Run make', 'message1', 'message2', '```'])
  })
})
