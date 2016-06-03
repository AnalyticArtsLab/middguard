var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');
var _ = require('lodash');
var Twitter = require('twitter');

exports.inputs = [];

exports.outputs = [
  'handle',
  'tweet',
  'timestamp'
];

exports.displayName = "@DanaRSilver";

var client = new Twitter({
  consumer_key: 'fEYwq7R6fP7np546j799dMXJj',
  consumer_secret: '5pAk0lrSEZ1hrhbnRG6pJdcQIYkKMtIFNPvsyzV8jjyuhSnOCl',
  access_token_key: '354037431-sd7fd6inZSXWaw9LmC3gmFfaHWx6p8UJq8JUaPDM',
  access_token_secret: 'B8clfzqPuJqUWKnSGTsEpV3eF1Y35RiIw7HI6YiMSOleS'
});

client = Promise.promisifyAll(client);

exports.handle = function(context) {
  var params = {screen_name: 'DanaRSilver', count: 200};
  return client.getAsync('statuses/user_timeline', params)
  .spread(function(tweets, response) {
    tweets = tweets.map(function(tweet) {
      return {
        handle: tweet.user.screen_name,
        tweet: tweet.text,
        timestamp: new Date(tweet.created_at)
      };
    });

    return context.table.knex.insert(tweets);
  });
};

exports.createTable = function(tableName, knex) {
  return knex.schema.createTable(tableName, function(table) {
    table.string('handle');
    table.string('tweet');
    table.dateTime('timestamp');
  });
};
