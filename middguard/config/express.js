var express = require('express'),
    bodyParser = require('body-parser'),
    connectCookieParser = require('cookie-parser'),
    session = require('express-session'),
    path = require('path'),
    settings = require('./settings');

var root = settings.root;
var modulesPath = settings.modulesPath;

module.exports = function (app) {
  app.set('showStackError', true);

  app.use('/static', express.static(path.join(root, '/static')));
  app.use('/modules', express.static(path.join(root, modulesPath)));

  var sessionStore = new session.MemoryStore();
  app.set('sessionStore', sessionStore);

  var cookieParser = connectCookieParser(settings.SECRET);
  app.set('cookieParser', cookieParser);

  app.use(bodyParser());
  app.use(cookieParser);
  app.use(session({
    store: sessionStore,
    secret: settings.SECRET_KEY,
    resave: true,
    saveUninitialized: true
  }));

  app.set('views', path.join(root, 'middguard/views'));
  app.set('view engine', 'jade');
};