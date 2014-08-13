var middguard = require('./middguard'),
    packages = require('./packages'),
    auth = require('./auth');

module.exports = function (app) {
  app.get('/', middguard);

  app.get('/auth', auth.index);
  app.post('/auth/register', auth.register);
  app.post('/auth/login', auth.login);

  app.get('/models', packages.models);
  app.get('/analytics', packages.analytics);
};