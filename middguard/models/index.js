var modelsLoader = require('../loaders/models_loader');

module.exports = function (app, callback) {
  var Bookshelf = app.get('bookshelf');

  modelsLoader(Bookshelf, callback);
};