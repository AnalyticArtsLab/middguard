var env = require('./settings').env,
    knexConfig = require('./knex')[env];

module.exports = function (app) {
  var knex = require('knex')(knexConfig);

  var bookshelf = require('bookshelf')(knex);

  // Use named models to avoid circular import problems
  bookshelf.plugin('registry');

  app.set('bookshelf', bookshelf);
};