var modulesLoader = require('../loaders/modules_loader'),
    clientLibs = require('../config').clientLibs;

module.exports = function(req, res) {
  var modules = modulesLoader();
  res.render('index', {
    js: modules.js,
    css: modules.css,
    clientLibs: clientLibs
  });
};
