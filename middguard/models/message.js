/**
 * Register the Message model in the Bookshelf registry.
 *
 * @return {Bookshelf.Model}
 * @private
 */

module.exports = function (app) {
  var Bookshelf = app.get('bookshelf');

  var Message = Bookshelf.Model.extend({
    tableName: 'message',
    defaults: {
      timestamp: new Date().toISOString()
    },
    analyst: function () {
      return this.belongsTo('Analyst');
    }
  });

  return Bookshelf.model('Message', Message);
};
