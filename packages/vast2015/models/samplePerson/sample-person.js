module.exports = function (Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'people_table'
  });
};
