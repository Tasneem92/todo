const mongoose = require('mongoose');

const connectionUrl = process.env.MONGO_URL || "mongodb://server:server123@ds159707.mlab.com:59707/todo";

// Set mongoose.Promise to any Promise implementation
mongoose.Promise = global.Promise;
mongoose.connect(connectionUrl, function(err) {
    if(err) {
        console.error('Mongoose. Connection failure.', err);
        throw err
    }
    console.log('Mongoose successfully connected to database', connectionUrl);
});

module.exports = mongoose;
