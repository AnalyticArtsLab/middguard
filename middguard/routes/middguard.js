var modulesLoader = require('../loaders/modules_loader'),
    clientLibs = require('../config/client_libs'),
    appJs = require('../config/app_js');

module.exports = function(req, res) {
  modulesLoader(function (modules) {
    res.render('index', {
      js: modules.js,
      css: modules.css,
      appJs: appJs,
      clientLibs: clientLibs
    });
  });
};
