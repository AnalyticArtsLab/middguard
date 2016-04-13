var path = require('path');

exports.inputs = [
  {name: 'hashtags', inputs: ['hashtag', 'count']}
];

exports.outputs = [];

exports.displayName = "Hashtags Table";

exports.visualization = true;

exports.static = path.join(__dirname, 'static');

exports.js = [
  "hashtags-table-view.js"
];

exports.css = [
  "hashtags-table.css"
];
