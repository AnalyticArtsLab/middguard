var fs = require('fs'),
    path = require('path'),
    settings = require('../config/settings');

module.exports = function (app) {
  var Bookshelf = app.get('bookshelf');
  var register = Bookshelf.collection('models');
  var ModelPackage = Bookshelf.model('ModelPackage');

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var modelsPath = settings.modelsPath;
  var modelsAbsPath = path.resolve(modelsPath);

  fs.readdirSync(modelsAbsPath).forEach(function (model) {
    var manifestPath = path.join(modelsAbsPath, model, 'manifest.json');
    var manifest = JSON.parse(fs.readFileSync(manifestPath));

    var _name, _model, _load;

    if (hasOwnProperty.call(manifest, 'name') && manifest.name !== '') {
      _name = manifest.name;
    }

    if (hasOwnProperty.call(manifest, 'model') && manifest.model !== '') {
      _model = path.join('../../', modelsPath, model, manifest.model);
    } else {
      _model = path.join('../../', modelsPath, model);
    }

    if (hasOwnProperty.call(manifest, 'customLoad') && manifest.customLoad !== '') {
      _load = manifest.customLoad;
    }

    Bookshelf.model(_name, require(_model)(Bookshelf));

    register.add(new ModelPackage({
      name: _name,
      requirePath: path.join(modelsAbsPath, model, _model),
      customLoad: _load
    }))
  })
}