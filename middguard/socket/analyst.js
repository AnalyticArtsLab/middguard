var _ = require('lodash');

exports.read = function (socket, data, callback) {
  var Analyst = socket.bookshelf.model('Analyst');
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

exports.readAll = function (socket, data, callback) {
  var Analyst = socket.bookshelf.model('Analyst');

  Analyst.fetchAll()
  .then(function (analysts) {
    callback(null, analysts.toJSON());
  })
  .catch(function (error) {
    callback(error);
  });
};
