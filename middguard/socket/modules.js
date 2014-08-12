var modulesLoader = require('../loaders/modules_loader');

exports.readAll = function (data, callback) {
  modulesLoader(function (modules) {
    callback(null, modules.names);
  });
};