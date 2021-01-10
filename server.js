const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const mongoose = require("mongoose");
const config = require("./config.js");

// set express settings for serving content
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}));
app.set('view engine', 'pug');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

// server start listening
var server = http.listen(config.port, () => {
 console.log("Server is running on port ", server.address().port);
});

// socket.io listening for players
io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected.`);

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});

// connect mongodb database
//mongoose.set('useFindAndModify', false);
mongoose.connect(config.dbUrl, {useNewUrlParser: true, useUnifiedTopology: true }, (err) => { 
   console.log("Mongoose connected",err);
})

// pass app, mongoose and io to api routes
require('./routes')(app, mongoose, io);
