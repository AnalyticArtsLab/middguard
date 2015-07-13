var fs = require('fs'),
    path = require('path'),
    settings = require('../config/settings');

module.exports = function (app) {
  var register = app.get('bookshelf').collection('analytics');
  var AnalyticsPackage = app.get('bookshelf').model('AnalyticsPackage');

  var analyticsPath = 'packages/' + settings.app + '/analytics';
  var analyticsAbsPath = path.resolve(analyticsPath);

  fs.readdirSync(analyticsAbsPath).forEach(function (tool) {
    if (tool[0] === '.'|| !fs.lstatSync(path.join(modelsAbsPath, tool)).isDirectory()){
      // hidden directory, continue
      return;
    }
    var manifestPath = path.join(analyticsAbsPath, tool, 'manifest.json');
    var manifest = JSON.parse(fs.readFileSync(manifestPath));

    register.add(new AnalyticsPackage({
      name: manifest.name,
      requirePath: path.join(analyticsAbsPath, tool, manifest.main)
    }));
  });
};