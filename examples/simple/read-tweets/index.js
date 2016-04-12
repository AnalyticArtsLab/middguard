var fs = require('fs');
var path = require('path');

exports.inputs = [];

exports.outputs = [
  'handle',
  'tweet',
  'timestamp'
];

exports.displayName = "Read Tweets";

exports.handle = function(context, done) {
  console.log(`Running read-tweets with context: ${context}.`);
  done();
};

exports.createTable = function(tableName, knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.string('handle');
    table.string('tweet');
    table.dateTime('timestamp');
  });
};
