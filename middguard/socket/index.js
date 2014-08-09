var _ = require('lodash'),
    message = require('./message');

module.exports = function (err, socket, session) {
  if (!session.user) return socket.emit('session', {
    error: 'Not logged in!'
  });

  socket.on('messages:create', _.bind(message.create, socket));
  socket.on('messages:read', _.bind(message.read, socket));

  socket.on('modules:read', _.bind(require('./modules').read, socket));

  socket.on('analysts:create', _.bind(require('./analyst').create, socket));
};