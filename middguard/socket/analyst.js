var _ = require('lodash'),
    Analyst = require('../models/analyst');

exports.read = function (data, callback) {
  var analystId = _.result(data, 'id');

  new Analyst({id: analystId}).fetch()
  .then(function (analyst) {
    callback(null, analyst.toJSON());
  })
  .catch(Analyst.NotFoundError, function () {
    callback(null, {'error': 'Analyst ' + analystId + ' not found.'});
  })
  .catch(function (error) {
    callback(error);
  });
};

exports.readAll = function (data, callback) {
  Analyst.fetchAll()
  .then(function (analysts) {
    callback(null, analysts.toJSON());
  })
  .catch(function (error) {
    callback(error);
  });
};