const Router = require('@koa/router')
const { StatusCodes } = require('http-status-codes')
const yup = require('yup')
const validate = require('koa-yup-validator')
const queue = require('../services/queue')

const STRING_MAX_LENGTH = Number(process.env.STRING_MAX_LENGTH)

/**
 * Messages controller.
 * @module src/controllers/messages
 */

 /**
  * @const
  * @namespace MessagesRouter
  */
const router = new Router({ prefix: '/messages' })

// TODO: the schemas could be in its separate folder
const schemas = {
  limit: yup.number().positive().default(1),
  write: yup.object().shape({
    message: yup.string().max(STRING_MAX_LENGTH).required(),
  }),
  done: yup.object().shape({
    messageId: yup.string().min(1).required(),
  })
}

/**
 * It returns all available messages, starting from the oldest (FIFO).
 *
 * @name GET /messages
 * @function
 * @memberof module:src/controllers/messages~MessagesRouter
 *
 * @inner
 * @param {!string} path - Relative route path
 * @param {!callback} middleware - Validator middleware
 * @param {!callback} middleware - Route logic
 */
router.get('/', validate(schemas.limit, { path: 'request.query.limit' }), async (ctx) => {
  const { limit } = ctx.request.query

  const messagesToProcess = await queue.getAvailableMessages(limit)

  ctx.body = messagesToProcess
})

/**
 * Adds a message to the queue.
 *
 * @name POST /messages/write
 * @function
 * @memberof module:src/controllers/messages~MessagesRouter
 *
 * @inner
 * @param {!string} path - Relative route path
 * @param {!callback} middleware - Validator middleware
 * @param {!callback} middleware - Route logic
 */
router.post('/write', validate(schemas.write), async (ctx) => {
  const { message } = ctx.request.body
  const messageId = await queue.append(message)

  ctx.body = messageId
})

/**
 * Marks a message as processed by its ID.
 *
 * @name POST /messages/done
 * @function
 * @memberof module:src/controllers/messages~MessagesRouter
 *
 * @inner
 * @param {!string} path - Relative route path
 * @param {!callback} middleware - Validator middleware
 * @param {!callback} middleware - Route logic
 */
router.post('/done', validate(schemas.done) ,async (ctx) => {
  const { messageId } = ctx.request.body
  queue.markProcessed(messageId)

  ctx.body = StatusCodes.ACCEPTED
})

module.exports = router
