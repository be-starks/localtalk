var mongoose = require('mongoose');
var Settings = require("./settings")

var connected = false;

var connectionsPending = [];


mongoose.connect(Settings.db.url, function(err) {
    if (err) throw err;
    else {
        connectionsPending.forEach(function(callback) {callback();});
    }
});

module.exports = function (cb) {
    if(connected) {
        cb();
    }
    else {
        connectionsPending.push(cb);
    }
}
