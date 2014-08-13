var Bookshelf = require('../../app').get('bookshelf');

exports.models = function (req, res) {
  var models = Bookshelf.collection('models');

  res.json(models.toJSON());
};

exports.analytics = function (req, res) {
  var analytics = Bookshelf.collection('analytics');

  res.json(analytics.toJSON());
};