const crypto = require('crypto')
const { promisify } = require('util')
const randomBytesAsync = promisify(crypto.randomBytes)

const timeoutConfig = 1e3 * 20
const pendingMessages = {}
const fifo = []
const queue = {}

const releaseMessage = (msgId) => {
  const found = fifo.findIndex((queueEl) => queueEl.id === msgId)
  if (found !== -1) {
    const elm = fifo[found]
    fifo.splice(found, 1, { ...elm, available: true })
  }
}

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

queue.get = () => fifo

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

          const releaseTimer = setTimeout(releaseMessage, timeoutConfig, queueEl.id)
          pendingMessages[queueEl.id] = releaseTimer

          limitCounter++
        }
      }

      return availableMessages
    })
}

queue.markProcessed = (ids) => {
  ids.forEach(id => {
    const found = fifo.findIndex((queueEl) => queueEl.id === id)
    if (found !== -1) {
      fifo.splice(found, 1)
      const pendingTimer = pendingMessages[id]
      clearTimeout(pendingTimer)
    }
  })
}

module.exports = queue
