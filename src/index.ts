import * as core from '@actions/core'
import * as github from './github.js'
import { run } from './run.js'

const main = async (): Promise<void> => {
  // https://github.com/octokit/auth-action.js/issues/465
  const octokit = github.getOctokit(core.getInput('github-token', { required: true }))
  await run(
    {
      slackChannelId: core.getInput('slack-channel-id', { required: true }),
      slackThreadTs: core.getInput('slack-thread-ts') || undefined,
      slackAppToken: core.getInput('slack-app-token') || undefined,
      mentionMessage: core.getInput('mention-message') || undefined,
      githubCurrentJobStatus: core.getInput('github-job-status', { required: true }),
    },
    octokit,
    await github.getContext(),
  )
}

try {
  await main()
} catch (e) {
  core.setFailed(e instanceof Error ? e : String(e))
  console.error(e)
}
