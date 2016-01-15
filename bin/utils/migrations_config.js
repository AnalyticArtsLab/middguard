var settings   = require('../../middguard/config/settings'),
    knexConfig = require('../../middguard/config/knex')[settings.env],
    _          = require('lodash'),
    fs         = require('fs'),
    path       = require('path');

module.exports = function (program) {
  var baseConfig = { database: knexConfig };
  var configs = [];

  var usage =
  'Usage: migrate-latest\n' +
  '  --model <model>      Run migrations for a model in the active app\n' +
  '  --package <package>  Run all of a package\'s migrations\n' +
  '  --middguard          Run the standard MiddGuard migrations\n';

  if (!program.model && !program.middguard && !program.package) {
    console.log(usage);
    process.exit(1);
  }

  var specifyOneMessage = 'Specify only one of --model, --middguard, or --package';

  if (program.middguard) {
    console.assert(!program.model, specifyOneMessage);

    configs.push(_.clone(baseConfig, true));

    configs[0].directory = path.join(settings.root, 'migrations');
  }

  if (program.model) {
    console.assert(!program.middguard, specifyOneMessage);

    configs.push(_.clone(baseConfig, true));

    configs[0].directory = path.join(settings.root, 'packages', settings.app,
                                     'models', program.model, 'migrations');
  }

  if (program.package) {
    console.assert(!program.model && !program.middguard, specifyOneMessage);

    var packageModelsPath = path.join(settings.root, 'packages',
                                      program.package, 'models');

    getDirectories(packageModelsPath)
    .forEach(function (modelDirectory) {
      var modelConfig = _.clone(baseConfig, true);

      modelConfig.directory = path.join(packageModelsPath, modelDirectory,
                                        'migrations');

      configs.push(modelConfig);
    });
  }

  return configs;
};

function getDirectories(packagePath) {
  return fs.readdirSync(packagePath).filter(function (file) {
    return fs.statSync(path.join(packagePath, file)).isDirectory();
  });
}
