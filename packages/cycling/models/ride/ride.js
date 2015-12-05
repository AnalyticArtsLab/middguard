module.exports = function (Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'ride',
    gpsPoints: function () {
      return this.hasMany(Bookshelf.model('gps-point'));
    },
    cyclist: function () {
      return this.belongsTo(Bookshelf.model('cyclist'));
    }
  });
};
