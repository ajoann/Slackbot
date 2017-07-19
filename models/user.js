const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    slackId: String,
    authenticated: Boolean,
    google: Object,
    email: String,
    pending: String,
});


module.exports = mongoose.model('User', userSchema);
