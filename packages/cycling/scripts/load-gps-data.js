var app = require('../../../app');
var Promise = require('bluebird');
var _ = require('lodash');
var gpxParse = Promise.promisifyAll(require('gpx-parse'));
var fs = require('fs');
var path = require('path');

var basePath = '/Users/dsilver/Documents/workspace/middguard/data/activities';

var GPSPoint = app.get('bookshelf').model('gps-point');
var Cyclist = app.get('bookshelf').model('cyclist');
var Ride = app.get('bookshelf').model('ride');

var dana = Cyclist.forge({
  name: 'Dana Silver',
  location: 'Middlebury, VT'
});

var files = fs.readdirSync(basePath);

// limit to the last 10 rides for now
files = files.slice(files.length - 10);

dana
.fetch()
.then(function (cyclist) {
  if (!cyclist)
    return dana.save();

  return cyclist;
})
.then(function (cyclist) {
  return Promise.each(files, _.partial(addRide, cyclist));
})
.then(function () {
  app.get('bookshelf').knex.destroy();
});


function addRide(cyclist, file) {
  console.log('Adding ride from file', file);
  return gpxParse.parseGpxFromFileAsync(path.join(basePath, file))
  .then(function (data) {
    return cyclist.rides().create({
      name: data.tracks[0].name
    })
    .then(_.partial(addGpsPoints, data));
  });
}

function addGpsPoints(data, ride) {
  return Promise.map(data.tracks[0].segments[0], function (point) {
    return ride.gpsPoints().create({
      latitude: point.lat,
      longitude: point.lon,
      elevation: +point.elevation[0],
      time: point.time,
      cyclist_id: ride.get('cyclist_id')
    });
  });
}
