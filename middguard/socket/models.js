var Bookshelf = require('../../').get('bookshelf');

exports.readAll = function (data, callback) {
  var models = Bookshelf.collection('models');

  callback(null, models.toJSON());
};
