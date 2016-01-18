require('./analyst');
var Bookshelf = require('../../').get('bookshelf');

var Message = Bookshelf.Model.extend({
  tableName: 'message',
  defaults: {
    timestamp: new Date().toISOString()
  },
  analyst: function () {
    return this.belongsTo('Analyst');
  }
});

module.exports = Bookshelf.model('Message', Message);
