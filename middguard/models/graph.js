/**
 *
 */

module.exports = function(app) {
  var Bookshelf = app.get('bookshelf');

  var Graph = Bookshelf.Model.extend({
    tableName: 'graph',

    nodes: function() {
      return this.hasMany('Node');
    }
  });

  return Bookshelf.model('Graph', Graph);
};
