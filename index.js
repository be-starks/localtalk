Math.toRadians = function(d) {
	return d * Math.PI / 180;
}
Math.toDegrees = function(r) {
	return r * 180 / Math.PI;
}
Math.isNumber = function (n) {
	return (n || n === 0) && isFinite(n) && n != null;
}


var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var Settings = require("./settings.js");

var User = require('./models/user.js');

var app = express();

app.use(require("morgan")("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("static"));
app.use(require("method-override")());
// app.use(require("cookie-parser"));

var p1 = require("./mongodbConnection")();

var userRouter = express.Router();
var p2 = require("./userRoutes")(userRouter);
app.use(userRouter);

var listingRouter = express.Router();
require("./listingRoutes")(listingRouter);
app.use("/listings", listingRouter);

//Angular
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/static/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

Promise.all([p1, p2]).then(function startServer(value) {
    console.log("connection successful!");
    app.listen(Settings.port);
});
