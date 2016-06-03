var express = require('express'),
    bodyParser = require('body-parser'),
    connectCookieParser = require('cookie-parser'),
    session = require('express-session'),
    KnexSessionStore = require('connect-session-knex')(session),
    path = require('path');

module.exports = function (app) {
  var knex = require('knex')(app.get('knex config'));

  app.set('showStackError', app.get('env') !== 'production');

  app.use('/static', express.static(path.join(__dirname, '..', 'static')));
  // app.use('/modules', express.static(path.join(root, modulesPath)));

  var sessionStore = new KnexSessionStore({ knex: knex });
  app.set('sessionStore', sessionStore);

  var cookieParser = connectCookieParser(app.get('secret key'));
  app.set('cookieParser', cookieParser);

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(cookieParser);
  app.use(session({
    store: sessionStore,
    secret: app.get('secret key'),
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
  }));

  app.set('views', path.join('..', 'views'));
  app.set('view engine', 'jade');
};
