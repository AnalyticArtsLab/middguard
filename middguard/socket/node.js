var Promise = require('bluebird');
var _ = require('lodash');

exports.create = function(socket, data, callback) {
  var Node = socket.bookshelf.model('Node');
  var modules = socket.bookshelf.collection('analytics');
  var module = modules.findWhere({name: data.module});

  if(module.get('singleton')){
    Node.where('module', data.module).fetchAll()
    .then(result=>{
      let status = result.at(0)?result.at(0).attributes.status:0;
      data.status = status;
      return data;
    }).then(data =>{
      new Node()
      .save(data, {clientCreate: true})
      .then(node => {
        node.createSockets(socket);
        callback(null, node.toJSON());
        socket.broadcast.emit('nodes:create', node.toJSON());
      });
    })
  }else{
    new Node()
    .save(data, {clientCreate:true})
    .then(node=>{
      node.createSockets(socket);
      callback(null, node.toJSON());
      socket.broadcast.emit('nodes:create', node.toJSON());
    });
  }

};

exports.readAll = function(socket, data, callback) {
  var Node = socket.bookshelf.model('Node');
  var nodes = new Node();
  if (data) {
    nodes = nodes.where(data);
  }

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
/**
* Changes the status of a node (right now: only nodes with singleton as true)
*
* @private
* @param {Object} the node whose status is to be changed
* @param {Object[]} the collection of nodes
* @param {Object} the connection to the client
* @param {integer} the status to apply to the node
*/
function changeStatus (node, Node, socket, status){
  var modules = socket.bookshelf.collection('analytics');
  var module = modules.findWhere({name: node.get('module')});
  if(module.get('singleton')){
    Node.where('module', node.get('module')).fetchAll()
      .then(result =>{
        var promises = [];
        result.forEach(r=>{
            promises.push(r.save({status:status}));
        });
        Promise.all(promises).then(function(n){
          n.forEach(mod =>{
            socket.emit('nodes:update', mod.toJSON());
            socket.broadcast.emit('nodes:update', mod.toJSON());
          });
        });
      });
  }else{
    node.save({status:status})
     .then(node=>{
       socket.emit('nodes:update', node.toJSON());
       socket.broadcast.emit('nodes:update', node.toJSON());
     })
  }

}
/**
* Helper function that loads data in object form into a database table.
* This uses a transaction to make the operation atomic, and chunks the
* data to get past the sqlite/knex connection limitations.
*
* @private
* @param {Object} a knex connection Object
* @param {Object} a knex QueryBuilder associated with the destination table
* @param {Object[]} an array of object to be inserted
* @param {boolean} a flag to indicate if the table should be cleared first
* @param {string} an name to put on the log message
* @param {Oject} the node object we are storing data for
* @param {Object} the collection of Nodes
* @param {Object} connection to client
*/

function storeData(knex, table, data, clear, name, node, Node, socket){
  return knex.transaction(function(trx){
    const CHUNK = 100;
    // const CHUNK = 500;  /*to force error, change CHUNK size to 500*/

    // start with a clear of the database
    var sequence = clear ? table.del().transacting(trx) : Promise.resolve();
    for (let i = 0; i < data.length; i += CHUNK){
      let d = data.slice(i, i+CHUNK);
      sequence = sequence.then(() => table.insert(d).transacting(trx));
    }
    sequence.then(trx.commit)
    .catch(trx.rollback);
  })
  .then(function(){
    console.log(name + ' : complete');
    return Promise.resolve();
  })
  .catch(function(){
    changeStatus(node, Node, socket, 3);
    throw new Error('Error in '+node.attributes.module);
  });

}


exports.run = function(socket, data, callback) {
  var Node = socket.bookshelf.model('Node');
  var modules = socket.bookshelf.collection('analytics');
  new Node({id:data.id})
  .fetch()
  .tap(node => node.ensureTable())
  .then(function(node){
      changeStatus(node, Node, socket, 1);
    return node;
  })
  .then(node => Promise.join(node, node.outputNodes()))
  .spread(function(node, outputs) {
    var module = modules.findWhere({name: node.get('module')}),
        connections = JSON.parse(node.get('connections')),
        context = {};
    if (require(module.get('requirePath')).visualization){
      // this is a visualziation, it won't do real work
      return Promise.join(node);
    }

    context.inputs = _.reduce(_.keys(connections), function(inputs, inputGroup) {
      var groupConnections = connections[inputGroup].connections;

      // Reduce the array of input output pairs to a single associative array
      // mapping input to output.
      var columns = _.reduce(groupConnections, function(connections, pair) {
        connections[pair.input] = pair.output;
        return connections;
      }, {});

      inputs[inputGroup] = {};
      inputs[inputGroup].knex = () => socket.bookshelf.knex(outputs[inputGroup].get('table'));
      inputs[inputGroup].cols = columns;
      inputs[inputGroup].tableName = outputs[inputGroup].get('table');

      return inputs;
    }, {});

    context.knex = socket.bookshelf.knex;

    context.table = {};
    context.table.knex = () => socket.bookshelf.knex(node.get('table'));
    context.table.name = node.get('table');

    context.storeData = (data, clear, name) => storeData(socket.bookshelf.knex,
                                                socket.bookshelf.knex(node.get('table')),
                                                data,
                                                clear || false,
                                                name || node.get('table'),
                                                node,
                                                Node,
                                                socket);
    context.throwError = (error) => {
      changeStatus(node, Node, socket, 3);
      if(error){
        throw error;
      }else{
        throw new Error('Error in '+node.attributes.module);
      }
    }

    var handle = require(module.get('requirePath')).handle;
    return Promise.join(node, handle(context));
  })
  .spread(function(node) {
    let moduleName = node.get('module');
     Node.where('module', moduleName).fetchAll()
     .then(result => {
       changeStatus(node, Node, socket, 2);
      });
  })
  .catch(callback);
};

exports.delete = function(socket, data, callback){

  var Node = socket.bookshelf.model('Node');
  new Node({id:data.id})
    .destroy()
};
