import { getFailedJobCause } from '../src/slack.js'

describe('getFailedJobCause', () => {
  it('should return lostCommunicationErrorMessage when the failureAnnotationMessages contain lost communication message', () => {
    const failedJob = {
      name: 'job1',
      failureAnnotationMessages: [
        'The self-hosted runner: example-vnvrd-runner-98tzt lost communication with the server. Verify the machine is running and has a healthy network connection. Anything in your workflow that terminates the runner process, starves it for CPU/Memory, or blocks its network access can cause this error.',
      ],
    }
    const templates = {
      lostCommunicationErrorMessage: 'SORRY',
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual(['SORRY'])
  })

  it('should return empty array when the failureAnnotationMessages are empty', () => {
    const failedJob = {
      name: 'job2',
      failureAnnotationMessages: [],
    }
    const templates = {
      lostCommunicationErrorMessage: 'SORRY',
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual([])
  })

  it('should return failureAnnotationMessages when the failureAnnotationMessages are not empty', () => {
    const failedJob = {
      name: 'job3',
      failureAnnotationMessages: ['message1', 'message2'],
    }
    const templates = {
      lostCommunicationErrorMessage: 'SORRY',
    }
    const cause = getFailedJobCause(failedJob, templates)
    expect(cause).toStrictEqual(['```', 'message1', 'message2', '```'])
  })
})
