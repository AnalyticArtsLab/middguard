var _ = require('lodash');
var Promise = require('bluebird');

exports.inputs = [
  {name: 'tweets1', inputs: ['handle', 'tweet', 'timestamp']},
  {name: 'tweets2', inputs: ['handle', 'tweet', 'timestamp']}
];

exports.outputs = [
  'mean1',
  'mean2',
  'difference',
  'p-value'
];

exports.displayName = 'Diff Two Means';

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
