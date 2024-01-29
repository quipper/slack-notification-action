# slack-notification-action [![test](https://github.com/quipper/slack-notification-action/actions/workflows/test.yaml/badge.svg)](https://github.com/quipper/slack-notification-action/actions/workflows/test.yaml)

This is an action to notify a status of GitHub Actions to a Slack channel.

## Example

<img width="450" alt="image" src="https://github.com/quipper/slack-notification-action/assets/321266/7604b25a-9aae-40c3-aef6-354b4657ec5a">

<!--
{
	"blocks": [
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "Check the workflow failure of <https://github.com/octocat/example|backend / test>"
				}
			]
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "```\nProcess completed with exit code 1.\n```"
			}
		},
		{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": "octocat/example/*main*"
				},
				{
					"type": "mrkdwn",
					"text": "<https://github.com/octocat/example/pull/123|#123>"
				},
				{
					"type": "mrkdwn",
					"text": "@octocat"
				}
			]
		}
	]
}
-->

## Getting Started

To nofity a failure of workflow run on `main` branch,

```yaml
name: slack-notification

on:
  workflow_run:
    workflows:
      - "**"
      # you can exclude some workflows, like:
      # - '!*-metrics'
    branches:
      - main
    types:
      - completed

jobs:
  send:
    if: github.event.workflow_run.conclusion == 'failure'
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: quipper/slack-notification-action@v1
        with:
          slack-channel-id: ABCDEF123 # your Slack channel ID
          slack-app-token: ${{ secrets.SLACK_APP_TOKEN }}
```

You need to set up your Slack App.
See https://github.com/slackapi/slack-github-action for details.

## Specification

This action ignores an event if the conclusion is cancelled or skipped.

For a large repository, it is recommended to create a personal access token or GitHub App token to mitigate the rate limit of `GITHUB_TOKEN`.

### Inputs

| Name               | Default        | Description             |
| ------------------ | -------------- | ----------------------- |
| `slack-channel-id` | (required)     | ID of the Slack channel |
| `slack-app-token`  | (required)     | Slack App Bot Token     |
| `github-token`     | `github.token` | GitHub token            |

### Outputs

| Name                          | Description                                        |
| ----------------------------- | -------------------------------------------------- |
| `annotation-failure-messages` | Annotation messages of failure in the workflow run |
| `payload`                     | JSON payload                                       |
