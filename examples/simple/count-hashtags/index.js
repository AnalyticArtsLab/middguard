var fs = require('fs');
var path = require('path');

exports.inputs = [
  {name: 'tweets1', inputs: ['handle', 'tweet', 'timestamp']},
  {name: 'tweets2', inputs: ['handle', 'tweet', 'timestamp']}
];

exports.outputs = [
  'hashtag',
  'count'
];

exports.displayName = 'Count Hashtags';
