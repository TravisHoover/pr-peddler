/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on('pull_request.opened', async context => {
    const pr = context.payload.pull_request
    const user = pr.user.login // Collecting Details of the person who created the PR
    const msg = context.issue({ body: ` Hey @${user} 👋, Thanks for the PR !!! You are Awesome.` })
    return context.github.issues.createComment(msg)
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
