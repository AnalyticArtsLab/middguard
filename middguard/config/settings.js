var path = require('path');

module.exports = {
  env: process.env.NODE_ENV || 'development',

  // The top level directory. This is where the db and packages are stored.
  // All other settings are defined from here.
  root: path.normalize(__dirname + '/../..'),

  // The name of the modules directory. This should change in conjunction with
  // `modulesPath` as defined below.
  modulesDir: 'modules',


  // The name of the SQLite database, stored at the root
  db: 'middguardDB',
  
  app: 'demo', //******* write the name of the directory ('app') whose models/modules you want to run *********
  
  SECRET_KEY: process.env.SECRET_KEY || 'turn down for what'
};