var path = require('path');

exports.inputs = [
  {name: 'hours', inputs: ['day', 'hour', 'count1', 'count2']}
];

exports.outputs = [];

exports.displayName = "Hours Heatmap";

exports.visualization = true;

exports.static = path.join(__dirname, 'static');

exports.js = [
  "hashtags-table-view.js"
];

exports.css = [
  "hashtags-table.css"
];

exports.mainView = 'HoursHeatmapView';
