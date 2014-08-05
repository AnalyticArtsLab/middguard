var moduleLoader = require('../loaders/modules_loader');

exports.read = function (data, callback) {
  moduleLoader(function (modules) {
    callback(null, modules.names);
  });
};