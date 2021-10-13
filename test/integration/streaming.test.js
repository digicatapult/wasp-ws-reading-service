/* eslint-disable no-console */
const { describe, before, it } = require('mocha')
const { expect } = require('chai')
const ws = require('ws')
const delay = require('delay')

const { setupRealServer, setupKafka } = require('./helper/setupHelper.js')
const { sendRawPayload } = require('./helper/streamingHelper')
const { KAFKA_READINGS_NOTIFICATIONS_TOPIC, PORT, API_MAJOR_VERSION } = require('../../app/env')

const topic = KAFKA_READINGS_NOTIFICATIONS_TOPIC

describe('Websockets', async function () {
  const context = { clients: [], streamedData: [] }

  afterEach(async () => {
    context.clients.forEach((client) => client.close())
    context.streamedData = []
    context.clients = []
  })

  setupKafka()
  setupRealServer(context)

  describe('Single client', async function () {
    before(async function () {
      this.timeout(10000)

      // Connect clients
      context.clients.push(
        new ws(`ws://localhost:${PORT}/${API_MAJOR_VERSION}/thing/thing-id/dataset/dataset-id/reading`).on(
          'message',
          (msg) => {
            context.streamedData.push(Buffer.from(msg).toString())
          }
        )
      )

      // Broadcast messages
      await sendRawPayload(topic, {
        key: 'dataset-id',
        value: JSON.stringify({
          dataset: {
            id: 'dataset-id',
            thingId: 'thing-id',
            type: 'type',
            label: 'label',
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
          reading: { temp: 30 },
        }),
      })
      await delay(3000)
    })

    it('should send the reading to a single client', function () {
      expect(context.streamedData).to.have.length(1)
      expect(context.streamedData[0]).to.equal(JSON.stringify({ temp: 30 }))
    })
  })

  describe('Many clients', function () {
    before(async function () {
      this.timeout(10000)

      // Connect clients
      context.clients.push(
        new ws(`ws://localhost:${PORT}/${API_MAJOR_VERSION}/thing/123/dataset/abc/reading`).on('message', (msg) => {
          context.streamedData.push(Buffer.from(msg).toString())
        }),
        new ws(`ws://localhost:${PORT}/${API_MAJOR_VERSION}/thing/123/dataset/abc/reading`).on('message', (msg) => {
          context.streamedData.push(Buffer.from(msg).toString())
        })
      )

      // Broadcast messages
      await sendRawPayload(topic, {
        key: 'abc',
        value: JSON.stringify({
          dataset: {
            id: 'abc',
            thingId: '123',
            type: 'type',
            label: 'label',
            updatedAt: Date.now(),
            createdAt: Date.now(),
          },
          reading: { something: 'value' },
        }),
      })
      await delay(3000)
    })

    it('should send the reading to many clients', function () {
      expect(context.clients).to.have.length(2)
      expect(context.streamedData).to.have.length(2)
      expect(context.streamedData[0]).to.equal(JSON.stringify({ something: 'value' }))
      expect(context.streamedData[1]).to.equal(JSON.stringify({ something: 'value' }))
    })
  })
})
