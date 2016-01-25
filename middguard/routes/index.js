var middguard = require('./middguard'),
    auth = require('./auth');

/**
 * Register the default MiddGuard routes in the context of the app.
 * Routes can reference `this`, the instance of MiddGuard, to access
 * the already instantiated connection to the database, etc.
 *
 * @private
 */

module.exports = function (app) {
  middguard = middguard.bind(app);
  auth = auth.map((fn) => fn.bind(app));

  app.get('/', middguard);

  app.get('/auth', auth.index);
  app.post('/auth/register', auth.register);
  app.post('/auth/login', auth.login);
  app.post('/logout', auth.logout);
};
