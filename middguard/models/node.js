'use strict';

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
        2: 'Done'
      };

      return statuses[this.get('status')];
    },

    createTableName: function() {
      return Node
      .where('module', this.get('module'))
      .count()
      .then(count => {
        return this.set('table', `${this.get('module')}_${count + 1}`);
      });
    },

    outputNodes: function() {

    },

    /**
     * Create this node's table if it doesn't already.
     */
    ensureTable: function() {
      return Bookshelf.knex.schema.hasTable(this.get('table'))
      .then(exists => {
        console.log('exists? ', exists);
        if (!exists) {
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
    }
  });

  return Bookshelf.model('Node', Node);
};
