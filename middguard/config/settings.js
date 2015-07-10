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
  modulesPath: 'packages/vast2015/modules',
  modelsPath: 'packages/vast2015/models',
  analyticsPath: 'packages/vast2015/analytics',

  // The name of the SQLite database, stored at the root
  db: 'middguardDB',
  
  //Set dbConfig appropriately for either an SQLite DB or a PostgreSQL DB
  //SQLITE EXAMPLE (DEFAULT)
  
	dbConfig: {
	 client: 'sqlite3',      // or 'pg',
	 connection: {          // or the various connection settings for pg
		 filename: 'middguardDB.db'
	  }
	},
  /* //POSTGRESQL EXAMPLE
  dbConfig: {
  	  client: 'pg',
  	  connection: {	
  			host     : '127.0.0.1',
  	    user     : 'candrews',
  	    password : '',
  	    database: 'vast2015'
  		}
  	},
  */
  SECRET_KEY: process.env.SECRET_KEY || 'turn down for what'
};