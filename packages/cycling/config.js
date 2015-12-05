var path = require('path');

module.exports = {
  env: process.env.NODE_ENV || 'development',

  // The top level directory. This is where the db and packages are stored.
  // All other settings are defined from here.
  root: path.normalize(__dirname + '/../..'),

  // The name of the modules directory. This should change in conjunction with
  // `modulesPath` as defined below.
  modulesDir: 'modules',

  //Set dbConfig appropriately for either an SQLite DB or a PostgreSQL DB
  // SQLite
  //
  dbConfig: {
   client: 'sqlite3',
   connection: {
     filename: 'cycling.db'
   },
   pool: {
     min: 0,
     max: 1
   }
  },

  // PostgreSQL
  // dbConfig: {
  //   client: 'pg',
  //   connection: {
  //     host     : '127.0.0.1',
  //     user     : '',
  //     password : '',
  //     database: ''
  //   }
  // },

  SECRET_KEY: process.env.SECRET_KEY || 'turn down for what'
};
