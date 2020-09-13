require("dotenv").config()
const Koa = require('koa');
const bodyParser = require('koa-bodyparser')
const messages = require('./controllers/messages')

const app = new Koa()

app.use(bodyParser())
app
  .use(messages.routes())
  .use(messages.allowedMethods())

app.listen(3000)