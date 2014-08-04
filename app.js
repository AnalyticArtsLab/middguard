var express = require('express'),
    socketio = require('socket.io'),
    http = require('http'),
    path = require('path'),
    expressConfig = require('./middguard/config/express'),
    bookshelfConfig = require('./middguard/config/bookshelf');

var app = express();
expressConfig(app);

var server = http.createServer(app);
var io = socketio(server);

bookshelfConfig(app);
require('./middguard/loaders/models_loader')(app);
require('./middguard/loaders/analytics_loader')(app);

io.on('connection', require('./middguard/socket'));

require('./middguard/routes')(app);

var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Listening on port %d...', port);
});

module.exports = app;