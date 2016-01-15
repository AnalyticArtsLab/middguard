var express = require('express'),
    bodyParser = require('body-parser'),
    connectCookieParser = require('cookie-parser'),
    session = require('express-session'),
    // SQLiteStore = require('connect-sqlite3')(session),
    KnexSessionStore = require('connect-session-knex')(session),
    path = require('path'),
    settings = require('./settings'),
    env = require('./settings').env,
    knexConfig = require('./knex')[env],
    knex = require('knex')(knexConfig);

var root = settings.root;
var modulesPath = 'packages/' + settings.app + '/modules';

module.exports = function (app) {
  app.set('showStackError', true);

  app.use('/static', express.static(path.join(root, '/static')));
  app.use('/modules', express.static(path.join(root, modulesPath)));
  /*
  if (settings.dbType == 'sqlite'){
    var sessionStore = new SQLiteStore({
      db: settings.db.substr(0, 9),
      dir: settings.root
    });
  } else {
    //if dbType == 'pg'
    */

  var sessionStore = new KnexSessionStore({ knex: knex });
  app.set('sessionStore', sessionStore);

  var cookieParser = connectCookieParser(settings.SECRET);
  app.set('cookieParser', cookieParser);

  app.use(bodyParser());
  app.use(cookieParser);
  app.use(session({
    store: sessionStore,
    secret: settings.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
  }));

  app.set('views', path.join(root, 'middguard/views'));
  app.set('view engine', 'jade');
};