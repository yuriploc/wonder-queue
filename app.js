require("dotenv").config()
const Koa = require('koa');
const helmet = require('koa-helmet')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser')
const messages = require('./src/controllers/messages')

const app = new Koa()

app.use(helmet());
app.use(cors({ origin: process.env.CORS, optionsSuccessStatus: 200 }));
app.use(bodyParser())
app
  .use(messages.routes())
  .use(messages.allowedMethods())

app.listen(3000)

module.exports = app
