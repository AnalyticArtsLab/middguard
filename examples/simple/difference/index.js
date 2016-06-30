var _ = require('lodash');
var Promise = require('bluebird');

exports.inputs = [
  {name: 'tweets1', inputs: ['day', 'hour', 'count']},
  {name: 'tweets2', inputs: ['day', 'hour', 'count']}
];

exports.outputs = [
  'day',
  'hour',
  'count1',
  'count2',
  'difference'
];

exports.displayName = 'Difference by Hour';

exports.createTable = function(tableName, knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.integer('day');
    table.integer('hour');
    table.integer('count1');
    table.integer('count2');
    table.integer('difference');
  });
};

exports.handle = function(context) {
  var tweets1 = context.inputs.tweets1,
      tweets2 = context.inputs.tweets2,
      week = [];

  return Promise.join(tweets1.knex().select('*'), tweets2.knex().select('*'),
  function(tweets1, tweets2) {
    _.range(24).forEach(function(hour) {
      _.range(7).forEach(function(day) {
        var count1 = _.find(tweets1, {hour: hour, day: day}).count;
        var count2 = _.find(tweets2, {hour: hour, day: day}).count;
        week.push({
          day: day,
          hour: hour,
          count1: count1,
          count2: count2,
          difference: Math.abs(count1 - count2)
        });
      });
    });

    return context.table.knex().insert(week);
  });
};
