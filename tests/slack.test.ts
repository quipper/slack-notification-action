import { getFailedJobCause, Templates } from '../src/slack.js'
import { FailedJob } from '../src/workflow-run.js'

describe('getFailedJobCause', () => {
  it('should return lostCommunicationErrorMessage when the failureAnnotationMessages contain lost communication message', () => {
    const failedJob: FailedJob = {
      name: 'job1',
      failureStepNames: [],
      failureAnnotationMessages: [
        'The self-hosted runner: example-vnvrd-runner-98tzt lost communication with the server. Verify the machine is running and has a healthy network connection. Anything in your workflow that terminates the runner process, starves it for CPU/Memory, or blocks its network access can cause this error.',
      ],
    }
    const templates: Templates = {
      lostCommunicationErrorMessage: 'SORRY',
      mentionMessage: '@octocat',
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual(['SORRY'])
  })

  it('should return empty array when the messages are empty', () => {
    const failedJob: FailedJob = {
      name: 'job2',
      failureStepNames: [],
      failureAnnotationMessages: [],
    }
    const templates: Templates = {
      lostCommunicationErrorMessage: 'SORRY',
      mentionMessage: '@octocat',
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual([])
  })

  it('should return the messages', () => {
    const failedJob: FailedJob = {
      name: 'job3',
      failureStepNames: ['Run make'],
      failureAnnotationMessages: ['message1', 'message2'],
    }
    const templates: Templates = {
      lostCommunicationErrorMessage: 'SORRY',
      mentionMessage: '@octocat',
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual(['```', 'Run make', 'message1', 'message2', '```'])
  })
})
