/**
 * Register the `Analyst` model in the Bookshelf registry.
 *
 * @return {Bookshelf.Model}
 * @private
 */

module.exports = function (app) {
  var Bookshelf = app.get('bookshelf');

  var Analyst = Bookshelf.Model.extend({
    tableName: 'analyst',
    hidden: ['password'],
    messages: function () {
      return this.hasMany('Message');
    }
  });

  return Bookshelf.model('Analyst', Analyst);
};
