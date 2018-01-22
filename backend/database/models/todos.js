const mongoose = require('../index'),
      Schema = mongoose.Schema,
      ObjectId = mongoose.Schema.Types.ObjectId

const schema = new Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    user: { type: ObjectId, ref: 'User' }
})

const ToDo = mongoose.model('ToDo', schema)

exports.ToDo = ToDo