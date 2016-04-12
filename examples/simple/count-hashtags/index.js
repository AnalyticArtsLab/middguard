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

exports.createTable = function(tableName, knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.string('hashtag');
    table.integer('count');
  });
};

exports.handle = function(context, done) {
  console.log(context);
  done();
};
