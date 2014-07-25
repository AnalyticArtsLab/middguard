var express = require('express'),
    path = require('path');

var env = process.env.NODE_ENV || 'development';
var root = path.normalize(__dirname + '/..');

exports.express = function (app) {
  app.set('showStackError', true);

  app.use('/static', express.static(root + '/static'));
  app.use('/modules', express.static(root + '/packages/modules'));

  app.set('views', root + '/middguard/views');
  app.set('view engine', 'jade');
};

exports.bookshelf = function (app) {
  var knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: path.resolve(root, settings.db)
    }
  });

  var bookshelf = require('bookshelf')(knex);

  app.set('db', bookshelf);
};

var settings = exports.settings = {
  root: root,
  modulesDir: 'modules',
  modulesPath: 'packages/modules',
  modelsPath: 'packages/models',
  analyticsPath: 'packages/analytics',
  db: 'default.db'
};

exports.clientLibs = {
  prefix: 'static/bower_components',
  js: [
    'jquery/dist/jquery.js',
    'underscore/underscore.js',
    'socket.io-client/socket.io.js',
    'backbone/backbone.js',
    'backbone.iobind/dist/backbone.iosync.js',
    'backbone.iobind/dist/backbone.iobind.js'
  ]
};