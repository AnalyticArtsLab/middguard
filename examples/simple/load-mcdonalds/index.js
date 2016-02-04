var fs = require('fs');
var path = require('path');
var csv = require('csv-parse');

// MiddGuard the constructor, not the instance
var middguard = require('../..');

module.exports = middguard.Analytics.extend({
  handle: function() {

  },


}, {
  inputs: {
    'tweets': ['tweet', 'timestamp', '']
  },
  output: ['']
});

csv.handle = function() {
  fs.createReadStream(path.join(__dirname, 'data', 'mcdonalds.csv')).pipe(saveCSV);
};

csv.save = function()
