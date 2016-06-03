var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');

exports.inputs = [
  {name: 'tweets', inputs: ['handle', 'tweet', 'timestamp']}
];

exports.outputs = [
  'handle',
  'day',
  'hour',
  'count'
];

exports.displayName = 'Time by Day/Hour';

exports.createTable = function(tableName, knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.string('handle');
    table.integer('day');
    table.integer('hour');
    table.integer('count');
  });
};

exports.handle = function(context) {
  var tweets = context.inputs.tweets,
      timestampCol = context.inputs.tweets.cols.timestamp,
      week = [];

  _.range(24).forEach(function(hour) {
    _.range(7).forEach(function(day) {
      week.push({day: day, hour: hour, count: 0});
    });
  });

  return tweets.knex.select('*')
  .then(function(tweets) {
    tweets.forEach(function(tweet) {
      var m = moment(tweet[timestampCol]),
          day = +m.format('d'),
          hour = +m.format('H');

      _.find(week, {day: day, hour: hour}).count++;
    });

    return context.table.knex.insert(week);
  });
};
