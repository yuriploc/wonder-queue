const Router = require('@koa/router')
const { StatusCodes } = require('http-status-codes')
const yup = require('yup')
const validate = require('koa-yup-validator')
const queue = require('../services/queue')

const router = new Router({ prefix: '/messages' })

const schemas = {
  limit: yup.number().positive().default(1),
  write: yup.object().shape({
    message: yup.string().max(2**53 - 1).required(),
  }),
  done: yup.array().of(yup.string()).min(1).required()
}

router.get('/', validate(schemas.limit, { path: 'request.query.limit' }), async (ctx) => {
  const { limit } = ctx.request.query

  const messagesToProcess = await queue.getAvailableMessages(limit)

  ctx.body = messagesToProcess
})

router.post('/write', validate(schemas.write), async (ctx) => {
  const { message } = ctx.request.body
  const messageId = await queue.append(message)

  ctx.body = messageId
})

router.post('/done', validate(schemas.done) ,async (ctx) => {
  const idsDone = ctx.request.body
  queue.markProcessed(idsDone)

  ctx.body = StatusCodes.ACCEPTED
})

module.exports = router
