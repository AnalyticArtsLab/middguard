var path = require('path');

module.exports = {
  env: process.env.NODE_ENV || 'development',

  // The top level directory. This is where the db and packages are stored.
  // All other settings are defined from here.
  root: path.normalize(__dirname + '/../..'),
  
  app: 'vast2015', //******* write the name of the directory ('app') whose models/modules you want to run *********
  
  SECRET_KEY: process.env.SECRET_KEY || 'turn down for what'
};