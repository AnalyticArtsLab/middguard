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

  app.middguardInit();

  return app;
}
