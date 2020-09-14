const yup = require('yup')

const STRING_MAX_LENGTH = Number(process.env.STRING_MAX_LENGTH)

const schemas = {
  limit: yup.number().positive().default(1),
  write: yup.object().shape({
    message: yup.string().max(STRING_MAX_LENGTH).required(),
  }),
  done: yup.object().shape({
    messageId: yup.string().min(1).required(),
  })
}

module.exports = schemas
