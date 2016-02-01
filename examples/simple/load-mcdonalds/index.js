var fs = require('fs');
var path = require('path');
var csv = require('csv-parse');
var analytics = require('../..').analytics;

var csv = analytics();

csv.configure = function () {
  this.inputs = {
    'mcdonalds': ['lat', 'lon', 'name', 'contact']
  }
};

csv.configure(() => {
  csv.in('tweets', [])
});

csv.handle = function() {
  fs.createReadStream(path.join(__dirname, 'data', 'mcdonalds.csv')).pipe(saveCSV);
};

csv.save = function()
