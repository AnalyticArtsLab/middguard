var path = require('path'),
settings = require('./settings');
		


module.exports = {
  development: settings.dbConfig,

  // For now, use the same setting for all envs
  staging: settings.dbConfig,
  production: settings.dbConfig
};