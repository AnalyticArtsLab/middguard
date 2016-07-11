var _ = require('lodash'),
    pluralize = require('pluralize'),
    analyst = require('./analyst'),
    message = require('./message'),
    modules = require('./modules'),
    node = require('./node'),
    io = require('socket.io')();

module.exports = function(socket) {
  var Bookshelf = socket.bookshelf;

  // Only set up sockets if we have a logged in user
  if (!socket.handshake.session.user) {
    return;
  }

  // Set up sockets middguard internal sockets
  socket.on('messages:create', (data, cb) => message.create(socket, data, cb));
  socket.on('messages:read', (data, cb) => message.readAll(socket, data, cb));

  socket.on('modules:read', (data, cb) => modules.readAll(socket, data, cb));

  socket.on('analyst:read', (data, cb) => analyst.read(socket, data, cb));
  socket.on('analysts:read', (data, cb) => analyst.readAll(socket, data, cb));

  socket.on('node:connect', (data, cb) => node.connect(socket, data, cb));
  socket.on('node:run', (data, cb) => node.run(socket, data, cb));
  socket.on('nodes:create', (data, cb) => node.create(socket, data, cb));
  socket.on('nodes:read', (data, cb) => node.readAll(socket, data, cb));
  socket.on('nodes:update', (data, cb) => node.update(socket, data, cb));

  var Graph = Bookshelf.model('Graph');
  patchModelToEmit(socket, 'graph', Graph);
  setupSocketEvents(socket, 'graph', Graph);

  Bookshelf.model('Node').fetchAll()
  .then(nodes => nodes.each(node => node.createSockets(socket)));
};

function patchModelToEmit(socket, modelName, model) {
  if (!model.prototype._emitting) {
    var _initialize = model.prototype.initialize;

    model.prototype.initialize = function() {
      var args = Array.prototype.slice.call(arguments);
      _initialize.apply(args);

      this.on('created', function(model, attrs, options) {
        // If the model was created on the client, we don't want to emit a
        // create event, since we need to assign an id on the creator via
        // a callback and do a broadcast.emit for everyone else.
        // The create listener will take care of this.
        if (!options.clientCreate) {
          io.emit(pluralize(modelName) + ':create', model.toJSON());
        } else {
          socket.broadcast.emit(pluralize(modelName) + ':create', model.toJSON());
        }
      });

      this.on('updated', function(model) {
        socket.broadcast.emit(pluralize(modelName) + ':update', model.toJSON());
      });

      this.on('destroying', function(model) {
        socket.broadcast.emit(pluralize(modelName) + ':delete', model.toJSON());
      });
    };

    model.prototype._emitting = true;
  }
}

function setupSocketEvents(socket, modelName, Model) {
  // Set up create, read, update, delete sockets for each model
  socket.on(pluralize(modelName) + ':create', function(data, callback) {
    // Pass clientCreate to save so the model won't emit anything on the
    // created event and confuse the client.
    // Create is a special case since the model on the creating client doesn't
    // have an id yet.
    new Model().save(data, {clientCreate: true})
      .then(function(newModel) {
        callback(null, newModel.toJSON());
      })
      .catch(function(error) {
        throw new Error(error);
      });
  });

  socket.on(modelName + ':update', function(data) {
    new Model({id: _.result(data, 'id')})
      .save(_.omit(data, 'id'), {patch: true});
  });

  socket.on(modelName + ':delete', function(data) {
    new Model({id: _.result(data, 'id')}).destroy();
  });

  socket.on(pluralize(modelName) + ':read', function(data, callback) {
    let query = new Model();

    if (data) {
      query = query.where(data).fetchAll();
    } else {
      query = query.fetchAll();
    }

    query
      .then(function(collection) {
        callback(null, collection.toJSON());
      })
      .catch(function(error) {
        callback(error);
      });
  });

  socket.on(modelName + ':read', function(data, callback) {
    new Model({id: _.result(data, 'id')}).fetch({require: true})
      .then(function(fetchedModel) {
        callback(null, fetchedModel.toJSON());
      })
      .catch(Model.NotFoundError, function() {
        callback({'error': `Model ${modelName} not found.`});
      })
      .catch(function(error) {
        callback(error);
      });
  });
}
