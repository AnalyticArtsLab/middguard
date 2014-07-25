var moduleLoader = require('../loaders/module_loader');

exports.read = function(data, callback) {
  moduleLoader(function (modules) {
    callback(null, modules.names);
  });
};