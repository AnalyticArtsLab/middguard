var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');

exports.inputs = [];

exports.outputs = [
  'handle',
  'tweet',
  'timestamp'
];

exports.displayName = "Read Tweets";

exports.handle = function(context, done) {
  var file = path.join(__dirname, '../data/tweets-sample-2016-03-21.json');

  fs.readFileAsync(file, 'utf8')
  .then(function(tweets) {
    tweets = tweets
    .split('\n')
    .filter(function(tweet) {
      return !!tweet && !_.has(JSON.parse(tweet), 'delete');
    })
    .map(function(tweet) {
      tweet = JSON.parse(tweet);

      return {
        handle: tweet.user.screen_name,
        tweet: tweet.text,
        timestamp: tweet.created_at
      };
    });

    // SQLite parameter limit is 999
    return context.table.knex().insert(_.take(tweets, 300));
  })
  .then(done);
};

exports.createTable = function(tableName, knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.string('handle');
    table.string('tweet');
    table.dateTime('timestamp');
  });
};
