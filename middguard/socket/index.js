var _ = require('lodash'),
    analyst = require('./analyst'),
    message = require('./message');

module.exports = function (err, socket, session) {
  if (!session.user) return;

  socket.on('messages:create', _.bind(message.create, socket));
  socket.on('messages:read', _.bind(message.readAll, socket));

  socket.on('modules:read', _.bind(require('./modules').read, socket));

  socket.on('analyst:read', _.bind(analyst.read, socket));
  socket.on('analysts:read', _.bind(analyst.readAll, socket));
};