var Bookshelf = require('../../').get('bookshelf');

var Relationship = Bookshelf.Model.extend({
  tableName: 'relationship'
});

module.exports = Bookshelf.model('Relationship', Relationship);
