var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');

exports.inputs = [];

exports.outputs = [
  'handle',
  'tweet',
  'timestamp',
  'hashtags'
];

exports.displayName = "Read Hashtags";

exports.handle = function(context) {
  var file = path.join(__dirname, '../data/tweets-sample-2016-03-21.json');

  return fs.readFileAsync(file, 'utf8')
  .then(function(tweets) {
    tweets = tweets
    .split('\n')
    .filter(function(tweet) {
      return !!tweet && !_.has(JSON.parse(tweet), 'delete');
    })
    .map(function(tweet) {
      tweet = JSON.parse(tweet);

      var hashtags = tweet.entities.hashtags.reduce(function(tags, hashtag) {
        return tags === '' ? hashtag.text : `${tags},${hashtag.text}`;
      }, '');

      return {
        handle: tweet.user.screen_name,
        tweet: tweet.text,
        timestamp: new Date(tweet.created_at),
        hashtags: hashtags
      };
    });

    // SQLite parameter limit is 999, so insert in chunks
    return Promise.each(_.chunk(tweets, 200), function(chunk) {
      return context.table.knex.insert(chunk);
    });
  });
};

exports.createTable = function(tableName, knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.string('handle');
    table.string('tweet');
    table.dateTime('timestamp');
    table.string('hashtags');
  });
};
