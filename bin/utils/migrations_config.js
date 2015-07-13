var settings = require('../../middguard/config/settings'),
    knexConfig = require('../../middguard/config/knex')[settings.env],
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
    config.directory = path.join(settings.root, 'packages', settings.app, 'models',
      program.model, 'migrations');
  }

  return config;
};