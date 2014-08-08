var express = require('express'),
    socketio = require('socket.io'),
    SessionSockets = require('./middguard/config/session_socket'),
    http = require('http'),
    path = require('path'),
    expressConfig = require('./middguard/config/express'),
    bookshelfConfig = require('./middguard/config/bookshelf');

var app = express();
module.exports = app;

expressConfig(app);

var server = http.createServer(app);
var io = socketio(server);

var sessionSockets = new SessionSockets(io,
  app.get('sessionStore'),
  app.get('cookieParser'));

bookshelfConfig(app);
require('./middguard/loaders/models_loader')(app);
require('./middguard/loaders/analytics_loader')(app);

sessionSockets.on('connection', require('./middguard/socket'));

require('./middguard/routes')(app);

var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Listening on port %d...', port);
});