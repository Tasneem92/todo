const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('express-jwt')
const jsonwebtoken = require('jsonwebtoken')
const path = require('path')
const HTTPError = require('../helpers/error')

const User = require('../database/models/users').User

router.route('/')
  .get(jwt({secret: process.env.JWT_SECRET || 'asd'}), async (req, res, next) => {
    const user = await User.findById(req.user._id).select('username email avatar _id')
    if (!user) return next(HTTPError('User does not exist', 401))
    return res.json({user, success: true})
  })

router.route('/login')
  .get(async (req, res) => {
    res.sendFile(path.join(__dirname + '/../../public/index.html'))
  })
  .post(async (req, res, next) => {
    let { username, password } = req.body
    if (!username) return next(HTTPError('Username is wrong', 400))
    if (!password) return next(HTTPError('Password is wrong', 400))
    
    const user = await User.findOne({username})
    if (!user) return next(HTTPError('Invalid password or username', 400))
  
    const comparePassword = await bcrypt.compare(password, user.password)
    if (comparePassword != true) return next(HTTPError('Invalid password or username', 400))
    const token = jsonwebtoken.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET || 'asd')

    return res.json({
      info: 'Success!',
      success: true,
      user: {
        username: user.username,
        email: user.email,
        _id: user._id
      },
      jwttoken: token
    })
  })

router.route('/register')
  .get(async (req, res) => {
    res.sendFile(path.join(__dirname + '/../../public/index.html'))
  })
  .post(async (req, res, next) => {
    try {
      let { username, email, password, password1 } = req.body
      if (!username) return next(HTTPError('Username is required', 400))
      if (!password) return next(HTTPError('Password is required', 400))
      if (!email) return next(HTTPError('Email is required', 400))
      if (password1 != password) return next(HTTPError('Passwords must match', 400))

      const user = new User({username, password, email})
      const newUser = await user.save()
      const token = jsonwebtoken.sign({ _id: newUser._id, username: newUser.username }, process.env.JWT_SECRET || 'asd')

      return res.json({
        success: true,
        user: {
          username, password
        },
        jwttoken: token
      })
    } catch (err) {
      if (err.code == 11000) {
        return next(HTTPError('User already exist with this username', 400))
      }
      return next(HTTPError('Something went wrong, try again', 500))
    }
  })

router.route('/profile')
  .get(async (req, res) => {
    res.sendFile(path.join(__dirname + '/../../public/index.html'))
  })
  .post(jwt({secret: process.env.JWT_SECRET || 'asd'}), async (req, res, next) => {
    try {
      let {username, email} = req.body
      const user = await User.findById(req.user._id)
      if (!user) return next(HTTPError('User does not exist', 401))
      if (user.username != username) {
        user.username = username
      }
      user.email = email

      const updatedUser = await user.save()
      return res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
        }
      })
    } catch (err) {
      if (err.code == 11000) {
        return next(HTTPError('User already exist with this username', 400))
      }
      return next(HTTPError('Something went wrong, try again', 500))
    }
  })

router.post('/changepassword', jwt({secret: process.env.JWT_SECRET || 'asd'}), async (req, res, next) => {
  let {currentPassword, newPassword, repeatPassword} = req.body
  if (!currentPassword) return next(HTTPError('Current Password is required', 400))
  if (!newPassword) return next(HTTPError('New Password is required', 400))
  if (!repeatPassword) return next(HTTPError('Repeat Password is required', 400))
  if (newPassword != repeatPassword) return next(HTTPError('Passwords must match', 400))
  const user = await User.findById(req.user._id)
  if (!user) return next(HTTPError('User does not exist', 401))
  const comparePassword = await bcrypt.compare(currentPassword, user.password)
  if (!comparePassword) return next(HTTPError('Password is not valid', 400))
  user.password = newPassword
  await user.save()
  return res.json({
    success: true
  })
})

module.exports = router