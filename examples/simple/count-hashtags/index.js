var fs = require('fs');
var path = require('path');

exports.inputs = [
  {name: 'tweets1', inputs: ['handle', 'tweet', 'timestamp']},
  {name: 'tweets2', inputs: ['handle', 'tweet', 'timestamp']},
  {name: 'tweets3', inputs: ['handle', 'tweet', 'timestamp']},
  {name: 'tweets4', inputs: ['handle', 'tweet', 'timestamp']},
  {name: 'tweets5', inputs: ['handle', 'tweet', 'timestamp']},
  {name: 'tweets6', inputs: ['handle', 'tweet', 'timestamp']},
  {name: 'tweets7', inputs: ['handle', 'tweet', 'timestamp']}
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
