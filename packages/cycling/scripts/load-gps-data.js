var app = require('../../../app');
var gpxParse = require('gpx-parse');

GPSPoint = app.get('bookshelf').model('gps-point');
Cyclist = app.get('bookshelf').model('cyclist');

var aaron = Cyclist.forge({
  name: 'Aaron Newell',
  location: 'Queensbury, NY'
});

aaron
.fetch()
.then(function (cyclist) {
  if (!cyclist)
    return aaron.save();

  return cyclist;
})
.then(function (cyclist) {

  // FIXME: should return gpxParse as a promise
  gpxParse.parseGpxFromFile('/Users/dsilver/Documents/workspace/middguard/data/ride-2015-11-04.gpx', function (error, data) {
    data.tracks[0].segments[0].forEach(function (point) {
      cyclist.gpsPoints().create({
        latitude: point.lat,
        longitude: point.lon,
        elevation: +point.elevation[0],
        time: point.time,
      });
    });
  });
});
