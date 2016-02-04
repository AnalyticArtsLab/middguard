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
    }
  });

  return Bookshelf.model('Node', Node);
};
