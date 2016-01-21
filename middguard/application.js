'use strict';

var express = require('express');

var app = exports = module.exports = express();

app.middguardInit = function () {
  this.middguardMiddleware()


  this.middguardRoutes();
  this.middguardSockets();
};

/**
 * Setup the express middleware for MiddGuard.
 *
 * @private
 */

app.middguardMiddleware = function middguardMiddleware () {
  // config/express
};
