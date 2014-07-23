var middguard = require('./middguard');

module.exports = function (app) {
  app.get('/', middguard);
};