module.exports = function (Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'gpspoint',
    cyclist: function () {
      return this.belongsTo(Bookshelf.model('cyclist'));
    }
  });
};
