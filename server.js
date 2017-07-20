// NPM Packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Local Imports
const { rtm, web } = require('./services/slackrtm');
// const dbconfig = require('./config/database');
const routes = require('./routes/routes');

// Global Variables
const app = express();
const port = process.env.PORT || 3000

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Routes
app.use('/', routes);

// Database Connection
mongoose.connect(dbconfig.url);

// Start Server
app.listen(port, function() {
    console.log('Server Listening on port ' + port);
});

// Start Slack Websockets
// rtm.start();
