var _ = require('lodash'),
    pluralize = require('pluralize'),
    analyst = require('./analyst'),
    message = require('./message'),
    modules = require('./modules'),
    Bookshelf = require('../../app').get('bookshelf');

module.exports = function (err, socket, session) {
  if (!session || !session.user) return;

  socket.on('messages:create', socketContext(message.create, socket, session));
  socket.on('messages:read', _.bind(message.readAll, socket));

  socket.on('modules:read', _.bind(modules.readAll, socket));

  socket.on('analyst:read', _.bind(analyst.read, socket));
  socket.on('analysts:read', _.bind(analyst.readAll, socket));

  Bookshelf.collection('models').each(function (modelAttrs) {
    var name = modelAttrs.get('name');
    var model = Bookshelf.model(name);

    var _initialize = model.prototype.initialize;

    model.prototype.initialize = _.wrap(_initialize, function (init) {
      var args = Array.prototype.slice.call(arguments, 1);
      init.apply(args);

      this.on('created', function (data) {
        socket.emit(pluralize(name) + ':create', data);
      });

      this.on('updated', function (data) {
        socket.emit(name + ':update', data);
      });

      this.on('destroyed', function (data) {
        socket.emit(name + ':delete', data);
      });
    });

    socket.on(pluralize(name) + ':create', function (data, callback) {
      new model(data).save();
    });

    socket.on(name + ':update', function (data, callback) {
      new model({id: _.result(data, 'id')})
        .save(_.omit(data, 'id'), {patch: true});
    });

    socket.on(name + ':delete', function (data, callback) {
      new model({id: _.result(data, 'id')}).destroy();
    });

    socket.on(pluralize(name) + ':read', function (data, callback) {
      new model().fetchAll()
        .then(function (collection) {
          callback(null, collection.toJSON());
        })
        .catch(function (error) {
          callback(error);
        });
    });

    socket.on(name + ':read', function (data, callback) {
      new model({id: _.result(data, 'id')}).fetch({require: true})
        .then(function (fetchedModel) {
          callback(null, fetchedModel.toJSON());
        })
        .catch(model.NotFoundError, function () {
          callback(null, {'error': 'Model ' + name + ' not found.'});
        })
        .catch(function (error) {
          callback(error);
        });
    })
  });
};

function socketContext(fn, socket, session) {
  return _.wrap(fn, function (func, data, callback) {
    func(data, callback, socket, session);
  });
}