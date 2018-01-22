const express = require('express')
const path = require('path')
const jwt = require('express-jwt')
const HTTPError = require('../helpers/error')

const router = express.Router()

const ToDo = require('../database/models/todos').ToDo

router.route('/')
  .get(async (req, res) => {
    res.sendFile(path.join(__dirname + '/../../public/index.html'))
  })
  // create task
  .post(jwt({secret: process.env.JWT_SECRET || 'asd'}), async (req, res, next) => {
    let title = req.body.title
    if (!title) return next(HTTPError('Title is required', 400))
    let newToDoItem = new ToDo({
      title,
      user: req.user._id
    })
    let task = await newToDoItem.save()
    return res.json({
      success: true,
      task
    })
  })
  // edit task
  .put(jwt({secret: process.env.JWT_SECRET || 'asd'}), async (req, res, next) => {
    let {title, id} = req.body
    if (!id) return next(HTTPError('ID of task is required', 400))
    if (!title) return next(HTTPError('Title is required', 400))
    let todoItem = await ToDo.findById(id)
    if (!todoItem) return next(HTTPError('Cannot find task', 400))
    todoItem.title = title
    let task = await todoItem.save()
    return res.json({
      success: true,
      task
    })
  })
  // delete task
  .delete(jwt({secret: process.env.JWT_SECRET || 'asd'}), async (req, res, next) => {
    let id = req.query.id
    if (!id) return next(HTTPError('ID of task is required', 400))
    await ToDo.findByIdAndRemove(id)
    return res.json({
      success: true,
      id
    })
  })

// get list of user tasks
router.get('/list', jwt({secret: process.env.JWT_SECRET || 'asd'}), async (req, res) => {
  const list = await ToDo.find({user: req.user._id})
  return res.json({
    list,
    success: true
  })
})

// complete and uncomplete
router.get('/complete', jwt({secret: process.env.JWT_SECRET || 'asd'}), async (req, res, next) => {
  let id = req.query.id
  if (!id) return next(HTTPError('ID of task is required', 400))
  const item = await ToDo.findById(id)
  if (!item) return next(HTTPError('Task does not exist', 400))
  item.completed = !item.completed
  const task = await item.save()
  return res.json({
    success: true,
    task
  })
})

module.exports = router