const crypto = require('crypto')
const { promisify } = require('util')
const randomBytesAsync = promisify(crypto.randomBytes)

const fifo = []
const queue = {}

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

          limitCounter++
        }
      }

      return availableMessages
    })
}

queue.markProcessed = (ids) => {
  ids.forEach(id => {
    const found = fifo.findIndex((queueEl) => queueEl.id === id)
    fifo.splice(found, 1)
  })
}

module.exports = queue
