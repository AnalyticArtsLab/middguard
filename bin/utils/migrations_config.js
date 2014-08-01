var settings = require('../../middguard/config/settings'),
    knexConfig = require('../../knexfile')[settings.env],
    path = require('path');

module.exports = function (program) {
  var config = { database: knexConfig };

  var modelOrMiddguardMessage = 'Specify middguard with --middguard or a model'
    + 'to migrate with --model <model>';
  console.assert(program.model || program.middguard, modelOrMiddguardMessage);

  if (program.middguard) {
    console.assert(!program.model, 'Only specify --model or --middguard');
    config.directory = path.join(settings.root, 'migrations');
  }

  if (program.model) {
    console.assert(!program.middguard, 'Only specify --model or --middguard');
    config.directory = path.join(settings.root, settings.modelsPath,
      program.model, 'migrations');
  }

  return config;
};