var fs = require('fs'),
    path = require('path'),
    settings = require('../config').settings;

module.exports = function(callback) {
  var modules = {
    js: [],
    css: []
  };
  var modulesCount;
  var push = Array.prototype.push;

  var modulesPath = settings.modulesPath;
  var modulesAbsPath = path.resolve(modulesPath);
  var modulesDir = settings.modulesDir;

  fs.readdir(modulesAbsPath, function (err, list) {
    if (err) throw new Error(err);
    modulesCount = list.length;

    list.map(function (module) {
      var manifestPath = path.resolve(modulesAbsPath, module, 'manifest.json');

      fs.readFile(manifestPath, function (err, manifest) {
        if (err) throw new Error(err);

        manifest = JSON.parse(manifest);

        if (!manifest.js && !manifest.css) {
          console.warn('Module %s does not list any js or css files to load!',
            module);
        }

        if (manifest.js) {
          var prefixedJs = manifest.js.map(function (js) {
            return path.join(modulesDir, module, js);
          });
          push.apply(modules.js, prefixedJs);
        }
        if (manifest.css) {
          var prefixedCss = manifest.css.map(function (css) {
            return path.join(modulesDir, module, css);
          });
          push.apply(modules.css, prefixedCss);
        }

        modulesCount--;
        if (!modulesCount) callback(modules);
      });
    });

  });
};