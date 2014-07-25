var express = require('express'),
    socketio = require('socket.io'),
    http = require('http'),
    path = require('path'),
    config = require('./middguard/config');

var app = express();
config.express(app);

var server = http.createServer(app);
var io = socketio(server);

config.bookshelf(app);
require('./middguard/models')(app);

io.on('connection', require('./middguard/socket'));

require('./middguard/routes')(app);

var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Listening on port %d...', port);
});

module.exports = app;