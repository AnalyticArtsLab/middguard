var middguard = require('./middguard'),
    auth = require('./auth')
	fs = require('fs')
	path = require('path');

module.exports = function (app) {
  app.get('/', middguard);
  //allow any valid route
  fs.readdir(path.resolve('../middguard/packages'), function(err, files){
  	files.forEach(function(item){
  		if (item[0] !== '.'){
  			//avoid files/directories like .DS_Store
        app.get('/' + item, middguard);
  		}
  	})
  })
  app.get('/demo', middguard);

  app.get('/auth', auth.index);
  app.post('/auth/register', auth.register);
  app.post('/auth/login', auth.login);
  app.post('/logout', auth.logout);
};