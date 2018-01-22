const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 5000

app.use(express.static(path.join(__dirname + '/../public/')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// connect to Mongo database
require('./database')

// routers settings
const routers = require('./routers')
app.use('/', routers)

// Error handle
app.use((req, res, next) => {
  let err = new Error('Not found')
  err.status = 404
  next(err)
})
app.use((err, req, res, next) => {
  if (!err.status) err.status = 400
  return res.status(err.status).json({
    info: err.message,
    success: false
  })
})

app.listen(port, (req, res) => {
  console.log('Server started at', port)
})
