var Bookshelf = require('../../app').get('bookshelf');

exports.readAll = function (data, callback) {
  var models = Bookshelf.collection('models');

  callback(null, models.toJSON());
};