var Bookshelf = require('../../').get('bookshelf');

exports.readAll = function (data, callback) {
  var analytics = Bookshelf.collection('analytics');

  callback(null, analytics.toJSON());
};
