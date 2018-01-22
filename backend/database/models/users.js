const mongoose = require('../index'),
      Schema = mongoose.Schema

const bcrypt = require('bcryptjs')

const schema = new Schema({
    email: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

schema.pre('save', function(next) {
    let user = this
    if (!user.isModified('password')) return next()
    bcrypt.hash(user.password, 10, function(err, hash) {
        user.password = hash
        next()
    })
})

const User = mongoose.model('User', schema)

exports.User = User