// var modulesLoader = require('../loaders/modules_loader'),
//     clientLibs = require('../config/client_libs'),
//     appJs = require('../config/app_js');

/**
 * Expose the main, logged in route.
 */

module.exports = function(req, res) {
  if (!req.session.user) {
    return res.redirect('/auth');
  }

  res.render('index', {
    js: [],
    css: [],
    appJs: require('../config/app_js'),
    clientLibs: require('../config/client_libs'),
    user: {id: req.session.user.id, username: req.session.user.username}
  });

  // modulesLoader(function (modules) {
  //   res.render('index', {
  //     js: modules.js,
  //     css: modules.css,
  //     appJs: appJs,
  //     clientLibs: clientLibs,
  //     user: {id: req.session.user.id, username: req.session.user.username}
  //   });
  // });
};
