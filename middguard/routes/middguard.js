var modulesLoader = require('../loaders/modules_loader'),
    clientLibs = require('../config/client_libs');

module.exports = function(req, res) {
  modulesLoader(function (modules) {
    res.render('index', {
      js: modules.js,
      css: modules.css,
      clientLibs: clientLibs
    });
  });
};
