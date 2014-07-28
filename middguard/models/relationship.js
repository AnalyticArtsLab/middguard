var Bookshelf = require('../../app').get('bookshelf');

var Relationship = Bookshelf.Model.extend({
  tableName: 'relationship'
});

module.exports = Bookshelf.model('Relationship', Relationship);