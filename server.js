var express = require("express");
var mongoose = require("mongoose");
var config = require("./config.js");
var bodyParser = require("body-parser");

// start webserver on port 3000
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname));

var server = app.listen(3000, () => {
 console.log("Server is running on port ", server.address().port);
});

// connect mongodb database
mongoose.connect(config.dbUrl, {useNewUrlParser: true}, (err) => { 
   console.log("Mongoose connected",err);
})

// pass app to api routes
require('./routes')(app, mongoose, config);
