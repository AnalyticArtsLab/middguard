module.exports = function (Bookshelf) {
  return Bookshelf.Model.extend({
    tableName: 'cyclist',
    gpsPoints: function () {
      return this.hasMany(Bookshelf.model('gps-point'));
    },
    rides: function () {
      return this.hasMany(Bookshelf.model('ride'));
    }
  });
};
