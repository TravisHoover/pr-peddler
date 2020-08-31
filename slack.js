const https = require('https')
const webhookURL = process.env.SLACK_WEBHOOK

/**
 * Parses pull request and sends slack message with descriptions.
 * @param pr
 * @returns {Promise<unknown>}
 */
function sendSlackMessage (pr) {
  const messageBody = {
    username: pr.user.login, // This will appear as user name who posts the message
    text: `Can I get :eyes: on ${pr.html_url}`,
    icon_emoji: ':eyes:', // User icon, you can also use custom icons here
    attachments: [{
      fallback: 'test',
      color: '#eed140',
      fields: [
        {
          title: 'Repo',
          value: `${pr.head.repo.name}`,
          short: true
        },
        {
          title: 'Author',
          value: `${pr.user.login}`,
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

  return new Promise((resolve, reject) => {
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
}

module.exports = {
  sendSlackMessage
}
