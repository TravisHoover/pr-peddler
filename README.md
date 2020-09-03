[![Build Status](https://travis-ci.org/TravisHoover/pr-peddler.svg?branch=master)](https://travis-ci.org/TravisHoover/pr-peddler)
# pr-peddler

> A GitHub App built with [Probot](https://github.com/probot/probot) to provide metadata about pull requests.

## Setup
```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Deployment
Add a webhook for a Slack channel using [these instructions](https://api.slack.com/messaging/webhooks#:~:text=2.,toggle%20to%20switch%20it%20on.)
<br> Grab the rest of the needed environment variables from the GitHub App created by Probot
<br> The app may be deployed by any server that can run NodeJS, so Heroku would be fine.
<br> I went with [Glitch](https://www.glitch.com) and the deployment steps may be found [here](https://probot.github.io/docs/deployment/#deploy-the-app)

## Contributing

If you have suggestions for how pr-peddler could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Travis Hoover <traviskhoover@gmail.com>
