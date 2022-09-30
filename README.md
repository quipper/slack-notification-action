# slack-notification-action

This is an action to notify the workflow run from GitHub Actions to a Slack channel.

## Getting Started

### Prerequisite

- Create a Slack App in your Slack workspace
- Add a secret of the Slack App Bok Token to your GitHub repository
- Get the channel ID of your Slack channel
- Invite the Slack App to your Slack channel

### Create a workflow

To nofity a failure on main branch, create the following workflow:

```yaml
name: slack-notification

on:
  workflow_run:
    workflows:
      - '**'
      # you can exclude some workflows, like:
      # - '!*-metrics'
    branches:
      - main
    types:
      - completed

jobs:
  send:
    timeout-minutes: 10
    if: github.event.workflow_run.conclusion == 'failure'
    runs-on: ubuntu-latest
    steps:
      - uses: quipper/slack-notification-action@v1
        with:
          slack-channel-id: ABCDEF123 # your Slack channel
          slack-app-token: ${{ secrets.SLACK_APP_TOKEN }}
```


## Specification

This action ignores `workflow_run` events if the conclusion is cancelled or skipped.
It is recommended to set a personal access token or GitHub App token to mitigate the rate limit of `GITHUB_TOKEN`.

### Inputs

| Name | Default | Description
|------|----------|------------
| `slack-channel-id` | (required) | ID of the Slack channel
| `slack-app-token` | (required) | Slack App Bot Token
| `icon` | `:x:` | Icon in the payload
| `github-token` | `github.token` | GitHub token
