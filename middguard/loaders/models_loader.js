var fs = require('fs'),
    path = require('path'),
    settings = require('../config/settings');

module.exports = function (Bookshelf, callback) {
  var modelsCount;
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var modelsPath = settings.modelsPath;
  var modelsAbsPath = path.resolve(modelsPath);

  fs.readdir(modelsAbsPath, function (err, list) {
    if (err) throw new Error(err);

    modelsCount = list.length;

    list.map(function (model) {
      var manifestPath = path.join(modelsAbsPath, model, 'manifest.json');

      fs.readFile(manifestPath, function (err, manifest) {
        if (err) throw new Error(err);

        manifest = JSON.parse(manifest);

        var _name, _model;

        if (hasOwnProperty.call(manifest, 'name') && manifest.name !== '') {
          _name = manifest.name;
        }

        if (hasOwnProperty.call(manifest, 'model') && manifest.model !== '') {
          _model = path.join('../../', modelsPath, model, manifest.model);
        } else {
          _model = path.join('../../', modelsPath, model);
        }

        Bookshelf.model(_name, require(_model)(Bookshelf));

        modelsCount--;
        if (!modelsCount) callback();
      });
    });
  });
};