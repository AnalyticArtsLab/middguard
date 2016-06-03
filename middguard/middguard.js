'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash');
var express = require('express');
var proto = require('./application');

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

  _.extend(app, proto);

  // expressConfig(app);
  //
  // var server = http.createServer(app);
  // var io = socketio(server);
  // app.set('io', io);
  //
  // var sessionSockets = new SessionSockets(io,
  //   app.get('sessionStore'),
  //   app.get('cookieParser'));
  //
  // bookshelfConfig(app);
  //
  // // require('./middguard/loaders/models_loader')(app);
  // // require('./middguard/loaders/analytics_loader')(app);
  //
  // sessionSockets.on('connection', require('./middguard/socket'));
  //
  // require('./middguard/routes')(app);

  app.middguardInit();

  return app;
};
