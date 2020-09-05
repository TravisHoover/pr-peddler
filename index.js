module.exports = app => {
  const slack = require('./slack')
  const { Octokit } = require('@octokit/rest')
  const octokit = new Octokit()

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return octokit.issues.createComment({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.issue.number,
      body: issueComment
    })
  })

  app.on('pull_request.opened', async context => {
    const pr = context.payload.pull_request;
    if (pr.user.login !== 'dependabot[bot]') { // TODO check for any bot
      return slack.sendSlackMessage(pr);
    }
  })
}
