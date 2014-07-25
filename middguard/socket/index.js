module.exports = function (socket) {
  socket.on('modules:read', require('./modules').read);
};