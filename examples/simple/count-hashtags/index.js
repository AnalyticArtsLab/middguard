var fs = require('fs');
var path = require('path');

exports.inputs = [
  {name: 'tweets', inputs: ['handle', 'tweet', 'timestamp']}
];

exports.outputs = [
  'hashtag',
  'count'
];

exports.displayName = 'Count Hashtags';
