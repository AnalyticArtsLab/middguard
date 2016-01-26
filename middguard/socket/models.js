exports.readAll = function (socket, data, callback) {
  var Bookshelf = socket.bookshelf;
  var models = Bookshelf.collection('models');

  callback(null, models.toJSON());
};
