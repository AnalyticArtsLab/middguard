var app = require('../../../app');
var gpxParse = require('gpx-parse');

GPSPoint = app.get('bookshelf').model('gps-point');
Cyclist = app.get('bookshelf').model('cyclist');

var dana = Cyclist.forge({
  name: 'Dana Silver',
  location: 'Middlebury, VT'
});

dana
.fetch()
.then(function (cyclist) {
  if (!cyclist)
    return dana.save();

  return cyclist;
})
.then(function (cyclist) {
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

// var dana = new Cyclist({
//   name: 'Dana Silver',
//   location: 'Middlebury, VT'
// });
//
// Cyclist.where({name: 'Dana Silver'}).fetch()
// .then(function (cyclist) {
//   if (!cyclist) {
//     dana = dana.save();
//   }
// });
//
// gpxParse.parseGpxFromFile('/Users/dsilver/Documents/workspace/middguard/data/ride-2015-11-04.gpx', function (error, data) {
//   data.tracks[0].segments[0].forEach(function (point) {
//     new GPSPoint({
//       latitude: point.lat,
//       longitude: point.lon,
//       elevation: +point.elevation[0],
//       time: point.time,
//       cyclist: dana.id
//     }).save()
//   });
// });
