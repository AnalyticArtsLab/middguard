'use strict';

var express = require('express'),
    _ = require('lodash'),
    socketio = require('socket.io'),
    SessionSockets = require('./middguard/config/session_socket'),
    http = require('http'),
    path = require('path'),
    expressConfig = require('./middguard/config/express'),
    bookshelfConfig = require('./middguard/config/bookshelf');

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

/**
 * Create a middguard application.
 *
 * @return {Function}
 * @public
 */

function createApplication(settings) {
  var app = express();

  _.each(settings, (value, key) => {
    app.set(key, value);
  });

  expressConfig(app);

  var server = http.createServer(app);
  var io = socketio(server);
  app.set('io', io);

  var sessionSockets = new SessionSockets(io,
    app.get('sessionStore'),
    app.get('cookieParser'));

  bookshelfConfig(app);

  // require('./middguard/loaders/models_loader')(app);
  // require('./middguard/loaders/analytics_loader')(app);

  sessionSockets.on('connection', require('./middguard/socket'));

  require('./middguard/routes')(app);

  return app;
};

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

exports.listen = function listen() {
  return server.listen.apply(server, arguments);
};
