exports.readAll = function (socket, data, callback) {
  var analytics = socket.bookshelf.collection('analytics');

  callback(null, analytics.toJSON());
};
