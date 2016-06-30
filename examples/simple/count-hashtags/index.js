var _ = require('lodash');
var Promise = require('bluebird');

exports.inputs = [
  {name: 'tweets', inputs: ['handle', 'tweet', 'timestamp', 'hashtags']}
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

exports.handle = function(context) {
  var tweets = context.inputs.tweets,
      hashtagCol = context.inputs.tweets.cols.hashtags,
      hashtags = {},
      hashtagsArray = [];

  return tweets.knex().select(hashtagCol)
  .then(function(tweets) {
    tweets.forEach(function(tweet) {
      tweet.hashtags.split(',').forEach(function(hashtag) {
        if (_.has(hashtags, hashtag)) {
          hashtags[hashtag]++;
        } else {
          hashtags[hashtag] = 1;
        }
      });
    });

    _.each(hashtags, function(count, hashtag) {
      hashtagsArray.push({
        hashtag: hashtag,
        count: count
      });
    });

    return Promise.each(_.chunk(hashtagsArray, 200), function(chunk) {
      return context.table.knex().insert(chunk);
    });
  });
};
