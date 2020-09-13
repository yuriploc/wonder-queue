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
  const availableMsgs = Promise.resolve(true)
    .then(() => fifo.reduce((acc, queueEl) => {
        if (queueEl.available) {
          queueEl.available = false
          acc.push({
            id: queueEl.id,
            message: queueEl.message,
          })

          return acc
        }

        return acc
      }, [])
    )

  return availableMsgs
}

queue.markProcessed = (ids) => {
  ids.forEach(id => {
    const found = fifo.findIndex((queueEl) => queueEl.id === id)
    fifo.splice(found, 1)
  })
}

module.exports = queue
