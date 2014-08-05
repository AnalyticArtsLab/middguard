var path = require('path'),
    settings = require('./settings');

// Add `debug: true` to the config to log SQL statements
var development = {
  client: 'sqlite3',
  connection: {
    filename: path.join(settings.root, settings.db)
  }
};

module.exports = {
  development: development,

  // For now, use the same setting for all envs
  staging: development,
  production: development
};