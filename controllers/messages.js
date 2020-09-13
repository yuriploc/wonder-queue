const Router = require('@koa/router')
const { StatusCodes } = require('http-status-codes')
const queue = require('../services/queue')

const router = new Router({ prefix: '/messages' })

router.post('/write', async (ctx) => {
  const { message } = ctx.request.body
  const messageId = await queue.append(message)

  ctx.body = messageId
})

router.get('/', async (ctx) => {
  const limitQuery = Number(ctx.request.query.limit)
  const limit = Number.isNaN(limitQuery) ? 1 : limitQuery

  const messagesToProcess = await queue.getAvailableMessages(limit)

  ctx.body = messagesToProcess
})

router.post('/done', async (ctx) => {
  const idsDone = ctx.request.body
  queue.markProcessed(idsDone)

  ctx.body = 'OK'
})

module.exports = router
