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
      // console.log(this);
      // this.on('saving', this.createTableName);
    },

    connections: function() {
      return this.hasMany('Connection');
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
      return this.collection()
      .where({module: this.get('module')})
      .count()
      .then(count => {
        return this.set('table', count + 1);
      });
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
