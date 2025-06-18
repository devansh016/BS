const express = require('express');
const app = express();
const database = require('./utils/database');

const port = process.env.PORT || 80;

database.on('error', console.error.bind(console, 'connection error: '));
database.once('open', function () {
    console.log('Database Connected successfully');
});

app.listen(port, function () {
    console.log('App is running at port ' + port);
});
