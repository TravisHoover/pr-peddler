require('isomorphic-fetch')
const https = require('https')
const { GiphyFetch } = require('@giphy/js-fetch-api')
const { Octokit } = require('@octokit/rest')
const webhookURL = process.env.SLACK_WEBHOOK || 'https://hooks.slack.com/services/TEST/CHANNEL/TOKEN'

const gf = new GiphyFetch(process.env.GIPHY_KEY || 'GIPHY_SDK_API_KEY')

const peddler = (app) => {
  const octokit = new Octokit()

  const sendMessage = async (context) => {
    const pr = context.payload.pull_request
    const defaultBranch = pr.head.repo.default_branch || null
    const baseBranch = pr.base.ref || null
    const prTitle = pr.title
    let text
    let gif = ''
    if (process.env.GIPHY_KEY) {
      const bannedWords = ['cert', 'remove']
      const gifLookup = prTitle.split(' ').filter((word) => !bannedWords.includes(word)).join(' ')
      const { data: gifs } = await gf.search(`${gifLookup.substring(0, 49)}`, { sort: 'relevant', limit: 1, rating: 'pg-13' })
      gif = gifs[0].url || ''
    }
    if (prTitle.includes('Revert')) {
      text = `:revertit_parrot: ${pr.html_url} :revertit_parrot:`
    } else {
      text = `Can I get :eyes: on ${pr.html_url}
      ${gif}`
    }
    if (!pr.user.login.includes('[bot]') && !pr.draft && baseBranch === defaultBranch) {
      const messageBody = {
        username: pr.user.login, // This will appear as user name who posts the message
        text,
        icon_url: pr.user.avatar_url,
        attachments: [{
          fallback: 'test',
          color: '#eed140',
          fields: [
            {
              title: 'PR Title',
              value: `${prTitle}`,
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
      await new Promise((resolve, reject) => {
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
      return {
        message: 'Success',
        statusCode: 200
      }
    }
  }

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return octokit.issues.createComment({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.issue.number,
      body: issueComment
    })
  })

  app.on('pull_request.opened', async context => sendMessage(context))
  app.on('pull_request.ready_for_review', async context => sendMessage(context))
}

exports.peddler = peddler
