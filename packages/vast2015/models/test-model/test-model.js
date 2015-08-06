module.exports = function (Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'test_table'
  });
};