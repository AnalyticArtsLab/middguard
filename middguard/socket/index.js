var _ = require('lodash'),
    pluralize = require('pluralize'),
    analyst = require('./analyst'),
    analytics = require('./analytics'),
    message = require('./message'),
    models = require('./models'),
    modules = require('./modules'),
    Bookshelf = require('../../app').get('bookshelf');

module.exports = function (err, socket, session) {
  if (!session || !session.user) return;

  socket.on('messages:create', socketContext(message.create, socket, session));
  socket.on('messages:read', _.bind(message.readAll, socket));

  socket.on('modules:read', modules.readAll);
  socket.on('models:read', models.readAll);
  socket.on('analytics:read', analytics.readAll);

  socket.on('analyst:read', _.bind(analyst.read, socket));
  socket.on('analysts:read', _.bind(analyst.readAll, socket));

  Bookshelf.collection('models').each(function (modelAttrs) {
    var name = modelAttrs.get('name');
    var model = Bookshelf.model(name);

    if (!model.prototype._emitting) {
      var _initialize = model.prototype.initialize;

      model.prototype.initialize = function () {
        var args = Array.prototype.slice.call(arguments);
        _initialize.apply(args);

        this.on('created', function (model, attrs, options) {
          // If the model was created on the client, we don't want to emit a
          // create event, since we need to assign an id on the creator via
          // a callback and do a broadcast.emit for everyone else.
          // The create listener will take care of this.
          if (!options.clientCreate) {
            socket.emit(name + ':create', model.toJSON());
          }
        });

        this.on('updated', function (model) {
          socket.emit(name + ':update', model.toJSON());
        });

        this.on('destroyed', function (model) {
          socket.emit(name + ':delete', model.toJSON());
        });
      };

      model.prototype._emitting = true;
    }

    socket.on(pluralize(name) + ':create', function (data, callback) {
      // Pass clientCreate to save so the model won't emit anything on the
      // created event and confuse the client.
      // Create is a special case since the model on the creating client doesn't
      // have an id yet.
      new model().save(data, {clientCreate: true})
        .then(function (newModel) {
          callback(null, newModel.toJSON());
          socket.broadcast.emit(name + ':create', newModel.toJSON());
        })
        .catch(function (error) {
          throw new Error(error);
        })
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