var path = require('path');

module.exports = {
  env: process.env.NODE_ENV || 'development',

  // The top level directory. This is where the db and packages are stored.
  // All other settings are defined from here.
  root: path.normalize(__dirname + '/../..'),

  // hack, will be fixed when middguard is its own module
  app: 'cycling',

  SECRET_KEY: process.env.SECRET_KEY || 'turn down for what'
};
