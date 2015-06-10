var path = require('path'),
settings = require('./settings');
		
if (settings.dbType == 'sqlite'){
	//Add `debug: true` to the config to log SQL statements
	var development = {
	  client: 'sqlite3',
	  connection: {
	    filename: path.join(settings.root, settings.db)
	  }
	};
} else {
	var development = {
	  client: 'pg',
	  connection: {	
			//INSERT APPROPRIATE INFORMATION IN THE FOLLOWING FIELDS
			host     : '127.0.0.1',
	    user     : 'user1',
	    password : '',
	    database: 'middguard'
		}
	};
}

module.exports = {
  development: development,

  // For now, use the same setting for all envs
  staging: development,
  production: development
};