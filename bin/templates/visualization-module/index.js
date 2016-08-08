const path = require('path');

exports.inputs = [];

exports.outputs = [];

exports.displayName = '<%- displayName %>';

/*
* change singleton to false to allow node to create a unique table.
* if the node has inputs, singleton should be true.
*/
exports.singleton = true;

exports.visualization = true;

exports.static = path.join(__dirname, 'static');

exports.js = [
  '<%- moduleName %>.js'
];

exports.css = [
  '<%- moduleName %>.css'
];

exports.mainView = '<%- mainView %>';
