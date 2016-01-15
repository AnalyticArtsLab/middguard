var path = require('path'),
    settings = require('./settings'),

    // Database is set at the package level
    config = require(path.join('..', '..', 'packages', settings.app, 'config'));

module.exports = {
  development: config.dbConfig,

  // For now, use the same setting for all envs
  staging: config.dbConfig,
  production: config.dbConfig
};