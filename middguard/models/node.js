'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

/**
 * Register the `Node` model in the Bookshelf registry.
 *
 * @return {Bookshelf.Model}
 * @private
 */

module.exports = function(app) {
  var Bookshelf = app.get('bookshelf');

  var Node = Bookshelf.Model.extend({
    tableName: 'node',

    initialize: function() {
      this.on('creating', this.createTableName);
    },

    graph: function() {
      return this.belongsTo('Graph');
    },

    status: function() {
      var statuses = {
        0: 'Not run',
        1: 'In progress',
        2: 'Done',
        3: 'Error'
      };

      return statuses[this.get('status')];
    },

    createTableName: function() {
      var modules = Bookshelf.collection('analytics'),
          moduleName = this.get('module'),
          module = modules.findWhere({name: moduleName});
      if (require(module.get('requirePath')).singleton){
        return this.set('table', this.get('module'));
      }
      return Node
      .where('module', this.get('module'))
      .count()
      .then(count => {
        return this.set('table', `${this.get('module')}_${count + 1}`);
      });
    },

    /**
     * Get a mapping from input group names to output nodes.
     *
     * @return a promise for an object mapping input group name
     *         to a fetched output node
     */
    outputNodes: function() {
      var connections = JSON.parse(this.get('connections'));

      return Promise.reduce(_.keys(connections), function(outputs, inputGroup) {
        var outputId = connections[inputGroup].output_node;

        return new Node({id: outputId}).fetch()
        .then(node => {
          outputs[inputGroup] = node;
          return outputs;
        });
      }, {});
    },

    /**
     * Create this node's table if it doesn't already.
     */
    ensureTable: function() {
      return Bookshelf.knex.schema.hasTable(this.get('table'))
      .then(exists => {
        if (!exists && this.module().createTable) {
          return this.module().createTable(this.get('table'), Bookshelf.knex);
        }
      });
    },

    module: function() {
      var modules = Bookshelf.collection('analytics'),
          moduleName = this.get('module'),
          module = modules.findWhere({name: moduleName});

      return require(module.get('requirePath'));
    },

    /**
     * Set an input group on the node's connections.
     * The text column "connections" remains in its stringified JSON state.
     *
     * @param {String} inputGroup Input group to set.
     * @param {Object} connections Connections to set for `inputGroup`.
     * @return this
     */
    setInputGroup: function(inputGroup, connections) {
      let groups = JSON.parse(this.get('connections')) || {};
      groups[inputGroup] = connections;

      return this.set('connections', JSON.stringify(groups));
    },

    createSockets: function(socket) {
      socket.on(`${this.get('table')}:read`, (data, callback) => {
        let query = Bookshelf.knex(this.get('table'));

        if (!_.isEmpty(data)) {
          query = query.where(data).select('*');
        } else {
          query = query.select('*');
        }

        query.then(results => callback(null, results));
      });

    socket.on(`${this.get('table')}:create`, (data, callback) => {
      let query = Bookshelf.knex(this.get('table'))
      .insert(data);

      query.then(results => {
        console.log('creating ' + this.get('table') + ' entry');
        console.warn('This should share the results with connected parties');
        return callback(null, {id: results[0]});
      });
    });

    socket.on(`${this.get('table')}:update`, (data, callback) => {
      // strip out the extra property
      let strippedData = _.pickBy(data, (v,k) => k !== 'middguard_views');
      let query = Bookshelf.knex(this.get('table'))
      .where({id: data.id})
      .update(strippedData);

      query.then(results => {
        console.log('updating ' + this.get('table') + ' entry');
        console.warn('This should share the results with connected parties');
        return callback(null);
      });

    });
    }

  });

  return Bookshelf.model('Node', Node);
};
