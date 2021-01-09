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
var server = http.listen(3000, () => {
 console.log("Server is running on port ", server.address().port);
});

// socket.io listening for players
var connectCounter = 0; // counts the amount of socket.io connections
io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected.`);
  connectCounter++;

  io.sockets.emit('broadcast',{ playercount: connectCounter});

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected.`);
    connectCounter--;
    io.sockets.emit('broadcast',{ playercount: connectCounter});
  });
});

// connect mongodb database
mongoose.connect(config.dbUrl, {useNewUrlParser: true, useUnifiedTopology: true }, (err) => { 
   console.log("Mongoose connected",err);
})

// pass app to api routes
require('./routes')(app, mongoose);
