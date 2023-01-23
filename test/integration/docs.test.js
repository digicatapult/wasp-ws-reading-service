import { describe, before, it } from 'mocha'
import { expect } from 'chai'

import { setupServer } from './helper/setupHelper.js'

describe('async-docs', function () {
  const context = {}
  setupServer(context)

  before(async function () {
    context.response = await context.request.get(`/async-docs`)
  })

  it('should return 200', function () {
    expect(context.response.status).to.equal(200)
  })

  it('successfully returns the asyncapi docs json', function () {
    expect(JSON.stringify(context.response.body)).to.include('asyncapi')
  })
})
