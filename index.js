module.exports = app => {
  const slack = require('./slack')

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on('pull_request.opened', async context => {
    const pr = context.payload.pull_request;
    if (pr.user.login !== 'dependabot[bot]') { // TODO check for any bot
      return slack.sendSlackMessage(pr);
    }
  })
}
