var Bookshelf = require('../../app').get('bookshelf');

exports.readAll = function (data, callback) {
  var analytics = Bookshelf.collection('analytics');

  callback(null, analytics.toJSON());
};