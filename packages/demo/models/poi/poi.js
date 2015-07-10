module.exports = function (Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'points_of_interest'
  });
};