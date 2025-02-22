import * as core from '@actions/core'
import * as github from './github.js'
import { run } from './run.js'

const main = async (): Promise<void> => {
  // https://github.com/octokit/auth-action.js/issues/465
  const octokit = github.getOctokit(core.getInput('github-token', { required: true }))
  await run(
    {
      slackChannelId: core.getInput('slack-channel-id', { required: true }),
      slackAppToken: core.getInput('slack-app-token'),
      lostCommunicationErrorMessage: core.getInput('lost-communication-error-message', { required: true }),
      shutdownSignalErrorMessage: core.getInput('shutdown-signal-error-message', { required: true }),
      mentionMessage: core.getInput('mention-message'),
      githubCurrentJobStatus: core.getInput('github-job-status', { required: true }),
      githubContext: await github.getContext(),
    },
    octokit,
  )
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
