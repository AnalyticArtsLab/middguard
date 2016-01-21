var middguard = require('./middguard'),
    auth = require('./auth');

module.exports = function (app) {
  app.get('/', middguard);

  app.get('/auth', auth.index);
  app.post('/auth/register', auth.register);
  app.post('/auth/login', auth.login);
  app.post('/logout', auth.logout);
};
