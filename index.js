module.exports = app => {
  const slack = require('./slack')

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on('pull_request.opened', async context => {
    const pr = context.payload.pull_request
    const user = pr.user.login // Collecting Details of the person who created the PR
    const msg = context.issue({ body: ` Hey @${user} 👋, Thanks for the PR !!! You are Awesome.` })
    await slack.sendSlackMessage(pr)
    return context.github.issues.createComment(msg)
  })
}
