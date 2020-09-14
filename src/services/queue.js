const crypto = require('crypto')
const { promisify } = require('util')
const randomBytesAsync = promisify(crypto.randomBytes)

const timeoutConfig = process.env.TIMEOUT
const pendingMessages = {}

/**
 * Messages controller.
 * @module src/services/queue
 */

/**
 * @const
 * @namespace Queue
 */
const queue = {}

/**
 * @typedef QueueElement
 * @memberof module:src/services/queue~Queue
 * @type {object}
 * @property {string} id - The message ID.
 * @property {boolean} available - If the message is available to be consumed.
 * @property {string} message - The message itself.
 */

const fifo = []

/**
 * Set a message as available after a predefined timeout.
 *
 * @function
 * @memberof module:src/services/queue~Queue
 * @param {!string} msgId - The message ID
 */
const releaseMessage = (msgId) => {
  const found = fifo.findIndex((queueEl) => queueEl.id === msgId)
  if (found !== -1) {
    fifo[found].available = true
  }
}

/**
 * Append a message at the end of the queue. It becomes available as
 * soon as it's added.
 *
 * @function
 * @memberof module:src/services/queue~Queue
 * @param {!string} message - The message to add at the end of the queue
 * @returns {!string} The message ID
 */
queue.append = async (message) => {
  const randomBytes = await randomBytesAsync(4)
  const msgId = randomBytes.toString('hex')

  fifo.push({
    available: true,
    id: msgId,
    message,
  })

  return msgId
}

/**
 * Returns the queue. Useful during development.
 *
 * @returns {!Array<QueueElement>}
 */
queue.get = () => fifo

/**
 * Retrieves all available messages, starting from the oldest (FIFO), marking the
 * available ones as unavailable for next consumers. It has an important
 * side effect that is to start the timer to release a message if it's not
 * processed in a timely manner.
 *
 * @function
 * @memberof module:src/services/queue~Queue
 * @param {!number} limit - The max number of messages to be retrieved
 * @returns {!Array} Similar to the `QueueElement`, but without the internal `available` property
 */
queue.getAvailableMessages = (limit) => {
  let limitCounter = 0
  const availableMessages = []

  return Promise.resolve(true)
    .then(() => {
      for (const queueEl of fifo) {
        if (limitCounter === limit) {
          break
        }

        if (queueEl.available) {
          queueEl.available = false
          availableMessages.push({
            id: queueEl.id,
            message: queueEl.message,
          })

          // TODO: this could be a middleware to run after the return
          const releaseTimer = setTimeout(releaseMessage, timeoutConfig, queueEl.id)
          pendingMessages[queueEl.id] = releaseTimer

          limitCounter++
        }
      }

      return availableMessages
    })
}

/**
 * Removes a message from the key by its `id` property.
 *
 * @function
 * @memberof module:src/services/queue~Queue
 * @param {!string} id - The message ID to remove from the queue
 */
queue.markProcessed = (id) => {
  const found = fifo.findIndex((queueEl) => queueEl.id === id && !queueEl.available)
  if (found !== -1) {
    fifo.splice(found, 1)
    const pendingTimer = pendingMessages[id]
    clearTimeout(pendingTimer)
  }
}

module.exports = queue
