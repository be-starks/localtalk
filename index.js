var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var Settings = require("./settings.js");

var app = express();

require("./mongodbConnection")(startServer);

app.use(require("morgan")("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("static"));
app.use(require("method-override")());
// app.use(require("cookie-parser"));

var listingRouter = express.Router();

require("./routes")(listingRouter);
app.use("/listings", listingRouter);

//Angular
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/views/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

function startServer() {
    console.log("connection successful!");
    app.listen(Settings.port);
}
