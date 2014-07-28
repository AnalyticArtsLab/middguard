var express = require('express'),
    path = require('path'),
    settings = require('./settings');

var root = settings.root;
var modulesPath = settings.modulesPath;

module.exports = function (app) {
  app.set('showStackError', true);

  app.use('/static', express.static(path.join(root, '/static')));
  app.use('/modules', express.static(path.join(root, modulesPath)));

  app.set('views', path.join(root, 'middguard/views'));
  app.set('view engine', 'jade');
};