const { v4: uuidv4 } = require('uuid')

const timeoutConfig = Number(process.env.TIMEOUT)
const doneInterval = Number(process.env.DONE_INTERVAL)

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
 * @property {boolean} done - If the message was successfully processed.
 * @property {string} message - The message itself.
 */

let fifo = []

/**
 * Sets a message as available after a predefined timeout.
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
 * Removes all processed messages from the beginning of the queue up to
 * the first that wasn't processed yet. This relieves the load from
 * the `markProcessed` method.
 *
 * @function
 * @memberof module:src/services/queue~Queue
 */
const clearDoneMessages = () => {
  const found = fifo.findIndex((queueEl) => queueEl.done === false)
  if (found === 0) {
    return
  }
  if (found > 0) {
    fifo = fifo.slice(found)
  } else {
    fifo = []
  }
}

/**
 * Starts the interval to run the `clearDoneMessages` method
 *
 * @function
 * @memberof module:src/services/queue~Queue
 */
const startClearInterval = () => {
  setInterval(clearDoneMessages, doneInterval)
}

/**
 * Appends a message at the end of the queue. It becomes available as
 * soon as it's added.
 *
 * @function
 * @memberof module:src/services/queue~Queue
 * @param {!string} message - The message to add at the end of the queue
 * @returns {!string} The message ID (UUID V4)
 */
queue.append = async (message) => {
  const msgId = uuidv4()

  fifo.push({
    available: true,
    done: false,
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
    fifo[found].done = true
    const pendingTimer = pendingMessages[id]
    clearTimeout(pendingTimer)
  }
}

startClearInterval()

module.exports = queue
