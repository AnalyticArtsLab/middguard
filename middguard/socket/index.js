var _ = require('lodash'),
    pluralize = require('pluralize'),
    analyst = require('./analyst'),
    analytics = require('./analytics'),
    message = require('./message'),
    models = require('./models'),
    modules = require('./modules'),
    Bookshelf = require('../../app').get('bookshelf'),
    io = require('socket.io')();

module.exports = function (err, socket, session) {
  // Only set up sockets if we have a logged in user
  if (!session || !session.user) return;

  // Set up sockets middguard internal sockets
  socket.on('messages:create', socketContext(message.create, socket, session));
  socket.on('messages:read', _.bind(message.readAll, socket));

  socket.on('modules:read', modules.readAll);
  socket.on('models:read', models.readAll);
  socket.on('analytics:read', analytics.readAll);

  socket.on('analyst:read', _.bind(analyst.read, socket));
  socket.on('analysts:read', _.bind(analyst.readAll, socket));

  Bookshelf.collection('models').each(function (modelAttrs) {
    var modelName = modelAttrs.get('name');
    var model = Bookshelf.model(modelName);

    patchModelToEmit(socket, modelName, model);
    setupSocketEvents(socket, modelName, model);
  });

  var Relationship = require('../models/relationship');
  patchModelToEmit(socket, 'relationship', Relationship);
  setupSocketEvents(socket, 'relationship', Relationship);

  // Set up sockets to call analytics from client
  // Patched models will automatically emit create, update, and delete events
  Bookshelf.collection('analytics').each(function (analyticsAttrs) {
    var name = analyticsAttrs.get('name');
    var requirePath = analyticsAttrs.get('requirePath');

    socket.on('analytics:' + name, function (data, callback) {
      require(requirePath)(Bookshelf, data);
    });
  });
};

function patchModelToEmit(socket, modelName, model) {
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
          io.emit(pluralize(modelName) + ':create', model.toJSON());
        }else{
          socket.broadcast.emit(pluralize(modelName) + ':create', model.toJSON());
        }
      });

      this.on('updated', function (model) {
        socket.broadcast.emit(pluralize(modelName) + ':update', model.toJSON());
      });

      this.on('destroyed', function (model) {
        socket.broadcast.emit(pluralize(modelName) + ':delete', model.toJSON());
      });
    };

    model.prototype._emitting = true;
  }
}

function setupSocketEvents(socket, modelName, model) {
  // Set up create, read, update, delete sockets for each model
  socket.on(modelName + ':create', function (data, callback) {
    // Pass clientCreate to save so the model won't emit anything on the
    // created event and confuse the client.
    // Create is a special case since the model on the creating client doesn't
    // have an id yet.
    new model().save(data, {clientCreate: true})
      .then(function (newModel) {
        callback(null, newModel.toJSON());
        socket.broadcast.emit(modelName + ':create', newModel.toJSON());
      })
      .catch(function (error) {
        throw new Error(error);
      })
  });

  socket.on(modelName + ':update', function (data, callback) {
    new model({id: _.result(data, 'id')})
      .save(_.omit(data, 'id'), {patch: true});
  });

  socket.on(modelName + ':delete', function (data, callback) {
    new model({id: _.result(data, 'id')}).destroy();
  });

  socket.on(pluralize(modelName) + ':read', function (data, callback) {


    if (data){
      var fetchData = new model().query(data).fetchAll();
    } else {
      //if fetching all models at once
      var fetchData = new model().fetchAll();
    }
    fetchData
      .then(function (collection) {
        callback(null, collection.toJSON());
      })
      .catch(function (error) {
        callback(error);
      });
  });

  socket.on(modelName + ':read', function (data, callback) {
    new model({id: _.result(data, 'id')}).fetch({require: true})
      .then(function (fetchedModel) {
        callback(null, fetchedModel.toJSON());
      })
      .catch(model.NotFoundError, function () {
        callback(null, {'error': 'Model ' + modelName + ' not found.'});
      })
      .catch(function (error) {
        callback(error);
      });
  });
}

function socketContext(fn, socket, session) {
  return _.wrap(fn, function (func, data, callback) {
    func(data, callback, socket, session);
  });
}
