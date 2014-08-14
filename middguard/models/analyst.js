require('./message');
var Bookshelf = require('../../app').get('bookshelf');

var Analyst = Bookshelf.Model.extend({
  tableName: 'analyst',
  hidden: ['password'],
  messages: function () {
    return this.hasMany('Message');
  }
});

module.exports = Bookshelf.model('Analyst', Analyst);