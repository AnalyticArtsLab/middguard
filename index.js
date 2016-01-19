var express = require('express'),
    socketio = require('socket.io'),
    SessionSockets = require('./middguard/config/session_socket'),
    http = require('http'),
    path = require('path'),
    expressConfig = require('./middguard/config/express'),
    bookshelfConfig = require('./middguard/config/bookshelf');

var middguard = module.exports = express();

expressConfig(middguard);

var server = http.createServer(middguard);
var io = socketio(server);
middguard.set('io', io);

var sessionSockets = new SessionSockets(io,
  middguard.get('sessionStore'),
  middguard.get('cookieParser'));

bookshelfConfig(middguard);

require('./middguard/loaders/models_loader')(middguard);
require('./middguard/loaders/analytics_loader')(middguard);
require('./middguard/loaders/csv_loader')(middguard.get('bookshelf'));

sessionSockets.on('connection', require('./middguard/socket'));

require('./middguard/routes')(middguard);

/**
 * Listen for connections.
 *
 * A node `http.Server` is returned, with this
 * application (which is a `Function`) as its
 * callback.
 *
 * This is the same as `express.listen`, but uses
 * the already created server, rather than creating
 * a new one in `listen`. The `http.Server` must
 * already be created to setup socket.io.
 *
 * @return {http.Server}
 * @public
 */

middguard.listen = function listen() {
  return server.listen.apply(server, arguments);
};
