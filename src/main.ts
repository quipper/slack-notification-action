import * as core from '@actions/core'
import { run } from './run.js'

const main = async (): Promise<void> => {
  await run({
    slackChannelId: core.getInput('slack-channel-id', { required: true }),
    slackAppToken: core.getInput('slack-app-token'),
    githubToken: core.getInput('github-token', { required: true }),
    lostCommunicationErrorMessage: core.getInput('lost-communication-error-message', { required: true }),
    mentionMessage: core.getInput('mention-message'),
    githubCurrentJobStatus: core.getInput('github-job-status', { required: true }),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
