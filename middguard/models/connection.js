/**
 * Register the `Connection` model in the Bookshelf registry.
 *
 * Access this model using `Bookshelf.model('Connection')`.
 *
 * @return {Bookshelf.Model}
 * @private
 */

module.exports = function(app) {
  var Bookshelf = app.get('bookshelf');

  var Connection = Bookshelf.Model.extend({
    tableName: 'connection',

    from: function() {
      return this.belongsTo('Node');
    },

    to: function() {
      return this.belongsTo('Node');
    }
  });

  return Bookshelf.model('Connection', Connection);
};
