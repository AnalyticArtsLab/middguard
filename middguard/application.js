'use strict';

/**
 * Module dependencies.
 * @private
 */

var path = require('path');
var http = require('http');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var KnexSessionStore = require('connect-session-knex')(session);
var session = require('express-session');

/**
 * Application prototype methods to extend
 * the express application prototype.
 */

var app = exports = module.exports = {};


app.middguardInit = function () {
  this.middguardMiddleware();

  var server = http.createServer(this);
  this.set('http server', server);

  var io = socketio(server);
  app.set('io', io);

  var sessionSockets = new SessionSockets(io,
    this.get('sessionStore'),
    this.get('cookieParser')
  );

  sessionSockets.on('connection', require('./socket'));

  require('./routes')(this);
};

/**
 * Setup the express middleware for MiddGuard.
 *
 * @private
 */

app.middguardMiddleware = function middguardMiddleware() {
  this.use('/static', express.static(path.join(__dirname, 'static')));

  var knex = require('knex')(this.get('knex config'));
  var sessionStore = new KnexSessionStore({knex: knex});
  this.set('sessionStore', sessionStore);

  var cookieParser = cookieParser(this.get('secret key'));
  this.set('cookieParser', cookieParser);

  this.use(bodyParser.urlencoded({extended: true}));
  this.use(bodyParser.json());
  this.use(cookieParser);
  this.use(session({
    store: sessionStore,
    secret: this.get('secret key'),
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 7 * 24 * 60 * 60 * 1000}  // 1 week
  }));

  this.set('views', 'views');
  this.set('view engine', 'jade');
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

app.listen = function listen() {
  var server = this.get('http server');
  return server.listen.apply(server, arguments);
};
