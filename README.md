# slack-notification-action [![ts](https://github.com/quipper/slack-notification-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/quipper/slack-notification-action/actions/workflows/ts.yaml)

This is an action to notify a status of GitHub Actions to a Slack channel.

## Example

<img width="450" alt="image" src="https://github.com/quipper/slack-notification-action/assets/321266/d37350a5-36fa-4d4f-ad47-c8cc2c9bd25c">

<!--
# preview on https://app.slack.com/block-kit-builder
{
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Check the failure of workflow *<https://github.com/octocat/example|backend / test>*"
			}
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
      - uses: quipper/slack-notification-action@v2
        with:
          slack-channel-id: ABCDEF123 # your Slack channel ID
          slack-app-token: ${{ secrets.SLACK_APP_TOKEN }}
```

You need to set up your Slack App.
See https://github.com/slackapi/slack-github-action for details.

## Specification

This action ignores an event if the conclusion is cancelled or skipped.

When this action is run on `workflow_run` event, it inspects the target workflow run.
Otherwise, it inspects the current workflow run.

### Inputs

| Name               | Default        | Description                                                             |
| ------------------ | -------------- | ----------------------------------------------------------------------- |
| `slack-channel-id` | (required)     | ID of the Slack channel                                                 |
| `slack-thread-ts`  | -              | Thread timestamp to post message in                                     |
| `slack-app-token`  | -              | Bot token of Slack App. If not set, dry run is performed                |
| `github-token`     | `github.token` | GitHub token                                                            |
| `mention-message`  | `github.actor` | Message to mention the current user. Set to empty to disable mentioning |

### Outputs

None.
