var path = require('path');

module.exports = {
  env: process.env.NODE_ENV || 'development',

  // The top level directory. This is where the db and packages are stored.
  // All other settings are defined from here.
  root: path.normalize(__dirname + '/../..'),

  // The name of the modules directory. This should change in conjunction with
  // `modulesPath` as defined below.
  modulesDir: 'modules',

  // Paths to each of the package directories from the root.
  modulesPath: 'packages/modules',
  modelsPath: 'packages/models',
  analyticsPath: 'packages/analytics',

  // The name of the SQLite database, stored at the root
  db: 'middguard.db'
};