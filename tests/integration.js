const { promisify } = require('util')
const http = require('http')
const test = require('ava')
const got = require('got')
const listen = require('test-listen')
const app = require('../app')

const setTimeoutPromise = promisify(setTimeout)

test.before(async t => {
	t.context.server = http.createServer(app.callback())
	t.context.prefixUrl = await listen(t.context.server)
})

test.after.always(t => {
	t.context.server.close()
})

test.serial('[post /messages/write] produces a message in the queue', async t => {
  const { statusCode } = await got.post('messages/write', {
    prefixUrl: t.context.prefixUrl,
    json: { message: JSON.stringify({ model: 'XPTO9', database: 'postgres' }) }
  })

  t.is(statusCode, 200)
})

test.serial('[get /messages] without passing limit querystring', async t => {
  const {
    statusCode,
    body,
  } = await got('messages', { prefixUrl: t.context.prefixUrl } )
  t.is(statusCode, 200)

  const res = JSON.parse(body)
  t.is(res.length, 1)

  const { id } = res.shift()
  t.is(typeof id, 'string')
})

test.serial('gets a message passing a limit querystring', async t => {
  const { statusCode, body } = await got('messages', {
    prefixUrl: t.context.prefixUrl,
    searchParams: { limit: 2 }
  })
  t.is(statusCode, 200)

  const res = JSON.parse(body)
  t.is(res instanceof Array, true)
})

test.serial('mark a message as processed', async t => {
  await setTimeoutPromise(Number(process.env.TIMEOUT) + 10e3, 'foobar')
  const {
    statusCode: statusGet,
    body,
  } = await got('messages', { prefixUrl: t.context.prefixUrl })
  t.is(statusGet, 200)

  const res  = JSON.parse(body)
  const { id } = res.shift()

  const { statusCode } = await got.post('messages/done', {
    prefixUrl: t.context.prefixUrl,
    json: [id]
  })
  t.is(statusCode, 200)
})

test.todo('gets the same message after a timeout')
test.todo('throws an error when tries to write a long message')
