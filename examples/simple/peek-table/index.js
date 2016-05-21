var path = require('path');

exports.inputs = [
  {name: 'table', inputs: ['col1', 'col2', 'col3', 'col4']}
];

exports.outputs = [];

exports.displayName = "Peek Table";

exports.visualization = true;

exports.static = path.join(__dirname, 'static');

exports.js = [
  "peek-table-view.js"
];

exports.css = [
  "peek-table.css"
];

exports.mainView = 'PeekTableView';
