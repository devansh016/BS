const express = require('express');
const cors = require('cors');
const app = express();
const database = require('./utils/database');

const port = process.env.PORT || 80;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const identifyRoutes = require('./routes/identify');
app.use('/', identifyRoutes);

database.on('error', console.error.bind(console, 'connection error: '));
database.once('open', function () {
    console.log('Database Connected successfully');
});

app.listen(port, function () {
    console.log('App is running at port ' + port);
});
