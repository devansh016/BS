const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGODB_URL);
mongoose.Promise = global.Promise;

const connection = mongoose.connection;

module.exports = connection;
