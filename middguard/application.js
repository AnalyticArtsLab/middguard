'use strict';

/**
 * Module dependencies.
 * @private
 */

var path = require('path');
var http = require('http');

var babelify = require('babelify');
var bodyParser = require('body-parser');
var browserify = require('browserify-middleware');
var cookieParser = require('cookie-parser');
var express = require('express');
var socketio = require('socket.io');
var ios = require('socket.io-express-session');
var session = require('express-session');
var KnexSessionStore = require('connect-session-knex')(session);
var _ = require('lodash');

browserify.settings({
  transform: [babelify.configure({presets: ['es2015']})]
});

/**
 * Application prototype methods to extend
 * the express application prototype.
 */

var app = exports = module.exports = {};


app.middguardInit = function () {
  this.middguardExpressMiddleware();

  var server = http.createServer(this);
  this.set('http server', server);

  var io = socketio(server);
  this.set('io', io);
  this.middguardSocketMiddleware();

  io.on('connection', require('./socket'));

  require('./routes')(this);
};

/**
 * Setup the express middleware for MiddGuard.
 *
 * @private
 */

app.middguardExpressMiddleware = function middguardExpressMiddleware() {
  var staticRoot = path.join(__dirname, '..', 'static');

  this.use('/app-bundle.js', browserify(path.join(staticRoot, 'js', 'app.js')));

  this.use('/static', express.static(staticRoot));

  var knex = require('knex')(this.get('knex config'));
  var sessionStore = new KnexSessionStore({knex: knex});
  this.set('sessionStore', sessionStore);

  // Set up ORM middlware
  require('./config/bookshelf')(this);

  this.use(cookieParser(this.get('secret key')));
  this.use(bodyParser.urlencoded({extended: true}));
  this.use(bodyParser.json());

  this.set('session', session({
    store: sessionStore,
    secret: this.get('secret key'),
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 7 * 24 * 60 * 60 * 1000}  // 1 week
  }));
  this.use(this.get('session'));

  this.set('views', path.join(__dirname, 'views'));
  this.set('view engine', 'jade');
};

app.middguardSocketMiddleware = function middguardSocketMiddleware() {
  var io = this.get('io');
  var session = this.get('session');

  io.use(ios(session));

  io.use((socket, next) => {
    socket.bookshelf = this.get('bookshelf');
    next();
  });
};

/**
 * Register an analytics module with the `middguard` app.
 *
 * @return `middguard.Analytics`
 * @public
 */
app.module = function module(name, requirePath) {
  var Bookshelf = this.get('bookshelf');
  var AnalyticsModule = Bookshelf.model('AnalyticsModule');
  var register = Bookshelf.collection('analytics');

  var attributes = require(requirePath);

  if (_.has(attributes, 'visualization')) {
    this.use(`/modules/${name}`, express.static(attributes.static));
  }

  register.add(new AnalyticsModule({
    name: name,
    requirePath: requirePath,
    displayName: attributes.displayName,
    inputs: attributes.inputs,
    outputs: attributes.outputs,
    visualization: attributes.visualization,
    main: attributes.visualization ? attributes.mainView : null
  }));
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
