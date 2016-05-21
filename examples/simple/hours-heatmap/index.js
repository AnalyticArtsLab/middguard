var path = require('path');

exports.inputs = [
  {name: 'hours', inputs: ['day', 'hour', 'count1', 'count2']}
];

exports.outputs = [];

exports.displayName = "Hours Heatmap";

exports.visualization = true;

exports.static = path.join(__dirname, 'static');

exports.js = [
  "hours-heatmap-view.js"
];

exports.css = [
  "hours-heatmap.css"
];

exports.mainView = 'HoursHeatmapView';
