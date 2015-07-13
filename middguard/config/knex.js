var path = require('path'),
  settings = require('./settings'),
  //make DB configuration dependent on indiv. config file
  config = require('../../packages/' + settings.app + '/config');


module.exports = {
  development: config.dbConfig,

  // For now, use the same setting for all envs
  staging: config.dbConfig,
  production: config.dbConfig
};