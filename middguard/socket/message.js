var _ = require('lodash');

exports.create = function(socket, data, callback) {
  var session = socket.handshake.session;
  var Analyst = socket.bookshelf.model('Analyst');

  if (_.result(data, 'analyst_id') !== session.user.id) {
    return callback(null, {error: 'Request forbidden.'});
  }

  new Analyst({id: session.user.id}).fetch()
    .then(function(analyst) {
      return analyst.messages().create(_.omit(data, 'analyst_id', 'seen'));
    })
    .then(function(message) {
      callback(null, message.toJSON());
      socket.broadcast.emit('messages:create', message.toJSON());
    })
    .catch(function(error) {
      callback(error);
    });
};

exports.readAll = function(socket, data, callback) {
  var Message = socket.bookshelf.model('Message');

  Message.fetchAll({withRelated: ['analyst']})
    .then(function(messages) {
      callback(null, messages.toJSON());
    })
    .catch(function(error) {
      callback(error);
    });
};
