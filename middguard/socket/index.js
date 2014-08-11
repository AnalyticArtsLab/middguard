var _ = require('lodash'),
    analyst = require('./analyst'),
    message = require('./message');

module.exports = function (err, socket, session) {
  if (!session || !session.user) return;

  socket.on('messages:create', socketContext(message.create, socket, session));
  socket.on('messages:read', _.bind(message.readAll, socket));

  socket.on('modules:read', _.bind(require('./modules').read, socket));

  socket.on('analyst:read', _.bind(analyst.read, socket));
  socket.on('analysts:read', _.bind(analyst.readAll, socket));
};

function socketContext(fn, socket, session) {
  return _.wrap(fn, function (func, data, callback) {
    func(data, callback, socket, session);
  });
}