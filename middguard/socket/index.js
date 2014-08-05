var _ = require('lodash');

module.exports = function (socket) {
  socket.on('modules:read', _.bind(require('./modules').read, socket));

  socket.on('analysts:create', _.bind(require('./analyst').create, socket));
};