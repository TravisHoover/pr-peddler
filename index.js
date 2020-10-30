const https = require('https')
const webhookURL = process.env.SLACK_WEBHOOK
const { Octokit } = require('@octokit/rest')

const peddler = (app) => {
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
    const pr = context.payload.pull_request
    if (!pr.user.login.includes('[bot]') && !pr.draft) {
      const messageBody = {
        username: pr.user.login, // This will appear as user name who posts the message
        text: `Can I get :eyes: on ${pr.html_url}`,
        icon_url: pr.user.avatar_url,
        attachments: [{
          fallback: 'test',
          color: '#eed140',
          fields: [
            {
              title: 'PR Title',
              value: `${pr.title}`,
              short: true
            },
            {
              title: 'Repo',
              value: `${pr.head.repo.name}`,
              short: true
            },
            {
              title: 'Commits',
              value: `${pr.commits}`,
              short: true
            },
            {
              title: 'Additions',
              value: `${pr.additions}`,
              short: true
            },
            {
              title: 'Deletions',
              value: `${pr.deletions}`,
              short: true
            },
            {
              title: 'Changed files',
              value: `${pr.changed_files}`,
              short: true
            }
          ]
        }]
      }

      const payload = JSON.stringify(messageBody)
      const slackMessage = await new Promise((resolve, reject) => {
        const requestOptions = {
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          }
        }

        const req = https.request(webhookURL, requestOptions, (res) => {
          let response = ''

          res.on('data', (d) => {
            response += d
          })

          res.on('end', () => {
            resolve(response)
          })
        })

        req.on('error', (e) => {
          reject(e)
        })

        req.write(payload)
        req.end()
      })
      console.log('slackMessage', slackMessage)
      return {
        message: 'Success',
        statusCode: 200
      }
    }
  })
}

exports.peddler = peddler
