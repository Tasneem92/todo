const express = require('express')
const path = require('path')

const router = express.Router()

router.route('/')
  .get(async (req, res) => {
    res.sendFile(path.join(__dirname + '/../../public/index.html'))
  })

const todosRoute = require('./todos')
const usersRoute = require('./users')

router.use('/todos', todosRoute)
router.use('/users', usersRoute)

module.exports = router
