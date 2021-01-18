const { describe, beforeAll, beforeEach, test } = require('@jest/globals')
const nock = require('nock')
const myProbotApp = require('../index')
const { Probot } = require('probot')
const issuePayload = require('./fixtures/issues.opened')
const pullRequestPayload = require('./fixtures/pull_request.opened')
const revertPayload = require('./fixtures/revert_pr_opened.json')
const { GiphyFetch } = require('@giphy/js-fetch-api')
const issueComment = {
  body: {
    issue_number: 1,
    owner: 'hiimbex',
    repo: 'testing-things',
    body: 'Thanks for opening this issue!'
  }
}
const fs = require('fs')
const path = require('path')

jest.mock('@giphy/js-fetch-api')

describe('pr-peddler', () => {
  let probot
  let mockCert

  beforeAll((done) => {
    fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err, cert) => {
      if (err) return done(err)
      mockCert = cert
      done()
    })
  })

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({ id: 123, privateKey: mockCert })
    // Load our app into probot
    probot.load(myProbotApp.peddler)
  })

  test('creates a comment when an issue is opened', async () => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .persist()
      .post('/app/installations/2/access_tokens')
      .reply(200, { token: 'test' })

    // Test that a comment is posted
    nock('https://api.github.com')
      .persist()
      .post('/repos/hiimbex/testing-things/issues/1/comments', (body) => {
        expect(body).toMatchObject(issueComment)
        return true
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'issues', payload: issuePayload })
  })

  test('sends a Slack message when a pull request is opened', async () => {
    // Test that we correctly return a test token
    const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || 'https://hooks.slack.com/services/TEST/CHANNEL/TOKEN'
    const webhookURL = SLACK_WEBHOOK.replace('https://hooks.slack.com', '')
    nock('https://hooks.slack.com')
      .persist()
      .post(webhookURL)
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'pull_request', payload: pullRequestPayload })
  })

  test('adds gif to slack message', async () => {
    const searchSpy = jest.spyOn(GiphyFetch.prototype, 'search')
    searchSpy.mockImplementation(() => ({
      data: [{
        url: 'test'
      }]
    }))

    // Test that we correctly return a test token
    const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || 'https://hooks.slack.com/services/TEST/CHANNEL/TOKEN'
    process.env.GIPHY_KEY = 'test_key'
    const webhookURL = SLACK_WEBHOOK.replace('https://hooks.slack.com', '')
    nock('https://hooks.slack.com')
      .persist()
      .post(webhookURL)
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'pull_request', payload: pullRequestPayload })
  })

  test('sends a Slack message when a pull request is opened for a revert', async () => {
    // Test that we correctly return a test token
    const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || 'https://hooks.slack.com/services/TEST/CHANNEL/TOKEN'
    const webhookURL = SLACK_WEBHOOK.replace('https://hooks.slack.com', '')
    nock('https://hooks.slack.com')
      .persist()
      .post(webhookURL)
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'pull_request', payload: revertPayload })
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
