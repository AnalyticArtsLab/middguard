var Promise = require('bluebird');
var _ = require('lodash');

exports.create = function(socket, data, callback) {
  var Node = socket.bookshelf.model('Node');

  new Node()
  .save(data, {clientCreate: true})
  .then(node => {
    callback(null, node.toJSON());
    socket.broadcast.emit('nodes:create', node.toJSON());
  })
  .catch(callback);
};

exports.readAll = function(socket, data, callback) {
  var Node = socket.bookshelf.model('Node');
  var nodes = new Node();

  if (data) nodes = nodes.where(data);

  nodes.fetchAll()
  .then(collection => callback(null, collection.toJSON()))
  .catch(callback);
};

exports.update = function(socket, data, callback) {
  var Node = socket.bookshelf.model('Node');

  new Node({id: data.id})
  .save(_.omit(data, 'id'), {patch: true})
  .then(function(node) {
    callback(null, node.toJSON());
    socket.broadcast.emit('nodes:update', node.toJSON());
  })
  .catch(callback);
};

/* Connect data.inputNode at data.inputGroup to data.outputNode.
 */
exports.connect = function(socket, data, callback) {
  var Node = socket.bookshelf.model('Node');
  var modules = socket.bookshelf.collection('analytics');

  var outputNode = new Node({id: data.outputNode});
  var inputNode = new Node({id: data.inputNode});

  Promise.all([outputNode.fetch(), inputNode.fetch()])
  .spread(function(outputNode, inputNode) {
    var outputModule = modules.findWhere({name: outputNode.get('module')});
    var inputModule = modules.findWhere({name: inputNode.get('module')});

    // Get outputs list from the corresponding output module
    var outputs = require(outputModule.get('requirePath')).outputs;

    // Get inputs list from the corresponding input module
    var inputGroups = require(inputModule.get('requirePath')).inputs;
    var inputs = inputGroups.filter(function(group) {
      return group.name === data.inputGroup;
    })[0].inputs;

    // The array of connections we'll set on the input node
    var connections = {
      output_node: data.outputNode,
      connections: []
    };

    if (data.connections &&
        validateConnections(data.connections, inputs, outputs)) {
      // Use `data.connections` if the connections are valid
      connections.connections = data.connections;
    } else {
      // Match input and output names
      connections.connections = connectionsByName(inputs, outputs);
    }

    inputNode.setInputGroup(data.inputGroup, connections);
    return inputNode.save();
  })
  .then(node => {
    socket.emit('nodes:update', node.toJSON());
    socket.broadcast.emit('nodes:update', node.toJSON());
  })
  .catch(callback);
};

/**
 * Validate that all potential inputs and outputs have inputs and outputs on
 * with the same name on the respective nodes.
 *
 * @private
 * @param {Object[]} connections The passed in data of connections to set.
 * @param {Object[]} inputs Named inputs on the existing input node.
 * @param {Object[]} outputs Named outputs on the existing output node.
 */
function validateConnections(connections, inputs, outputs) {
  var potentialInputs = connections.map(connection => connection.input);
  var potentialOutputs = connections.map(connection => connection.output);

  return potentialInputs.length === potentialOutputs.length &&
         inputs.every(input => _.has(potentialInputs, input)) &&
         outputs.every(output => _.has(potentialOutputs, output));
}

/**
 * Generate the connections array by matching names between inputs and outputs.
 * Returns an array with size equivalent to the cardinality of inputs ∩ outputs.
 *
 * @private
 * @param {Object[]} inputs Inputs to match
 * @param {Object[]} outputs Outputs to match
 */
function connectionsByName(inputs, outputs) {
  return outputs.filter(output => _.indexOf(inputs, output) > -1)
                .map(output => ({output: output, input: output}));
}

exports.run = function(socket, data, callback) {
  var Node = socket.bookshelf.model('Node');
  var modules = socket.bookshelf.collection('analytics');

  new Node({id: data.id})
  .fetch()
  .tap(node => node.ensureTable())
  .then(node => node.save({status: 1}))
  .then(function(node) {
    socket.emit('nodes:update', node.toJSON());
    socket.broadcast.emit('nodes:update', node.toJSON());
    return node;
  })
  .then(node => Promise.join(node, node.outputNodes()))
  .spread(function(node, outputs) {
    var module = modules.findWhere({name: node.get('module')}),
        connections = JSON.parse(node.get('connections')),
        context = {};

    context.inputs = _.reduce(_.keys(connections), function(inputs, inputGroup) {
      var groupConnections = connections[inputGroup].connections;

      // Reduce the array of input output pairs to a single associative array
      // mapping input to output.
      var columns = _.reduce(groupConnections, function(connections, pair) {
        connections[pair.input] = pair.output;
        return connections;
      }, {});

      inputs[inputGroup] = {};
      inputs[inputGroup].knex = socket.bookshelf.knex(outputs[inputGroup].get('table'));
      inputs[inputGroup].cols = columns;
      inputs[inputGroup].tableName = outputs[inputGroup].get('table');

      return inputs;
    }, {});

    context.table = {};
    context.table.knex = socket.bookshelf.knex(node.get('table'));
    context.table.name = node.get('table');

    var handle = require(module.get('requirePath')).handle;
    return Promise.join(node, handle(context));
  })
  .spread(function(node, result) {
    return node.save({status: 2});
  })
  .then(function(node) {
    socket.emit('nodes:update', node.toJSON());
    socket.broadcast.emit('nodes:emit', node.toJSON());
  })
  .catch(callback);
};
