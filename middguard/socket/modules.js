/**
 * Respond to the modules:read event from a connected client.
 * Emits all registered analytics modules.
 *
 * @return undefined
 * @private
 */

exports.readAll = function(socket, data, callback) {
  var register = socket.bookshelf.collection('analytics');

  callback(null, register.toJSON());
};
