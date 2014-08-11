require('./message');
var Bookshelf = require('../../app').get('bookshelf');

var Analyst = Bookshelf.Model.extend({
  tableName: 'analyst',
  hidden: ['password'],
  initialize: function () {
    this.on('saving', this.validateSave);
    this.on('creating', this.hashPassword);
  },
  messages: function () {
    return this.hasMany('Message');
  }
});

module.exports = Bookshelf.model('Analyst', Analyst);