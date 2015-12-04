var app = require('../../../app');
var Promise = require('bluebird');
var gpxParse = Promise.promisifyAll(require('gpx-parse'));
var fs = require('fs');
var path = require('path');

var basePath = '/Users/dsilver/Documents/workspace/middguard/data/activities';

GPSPoint = app.get('bookshelf').model('gps-point');
Cyclist = app.get('bookshelf').model('cyclist');

var dana = Cyclist.forge({
  name: 'Dana R. Silver',
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

  var files = fs.readdirSync(basePath);

  return Promise.each(files, function (file) {
    return gpxParse.parseGpxFromFileAsync(path.join(basePath, file))
    .then(function (data) {
      return Promise.map(data.tracks[0].segments[0], function (point) {
        return cyclist.gpsPoints().create({
          latitude: point.lat,
          longitude: point.lon,
          elevation: +point.elevation[0],
          time: point.time,
        });
      });
    });
  })

  // FIXME: should return gpxParse as a promise
  // gpxParse.parseGpxFromFile('/Users/dsilver/Documents/workspace/middguard/data/ride-2015-11-04.gpx', function (error, data) {
  //   data.tracks[0].segments[0].forEach(function (point) {
  //     cyclist.gpsPoints().create({
  //       latitude: point.lat,
  //       longitude: point.lon,
  //       elevation: +point.elevation[0],
  //       time: point.time,
  //     });
  //   });
  // });
});
