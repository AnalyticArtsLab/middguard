var env = require('./settings').env,

    // knexfile.js is in the root dir so the knex binary can find it for
    // migrations. This will change soon with a real build system.
    knexConfig = require('../../knexfile')[env];

module.exports = function (app) {
  var knex = require('knex')(knexConfig);

  var bookshelf = require('bookshelf')(knex);

  // Use named models to avoid circular import problems
  bookshelf.plugin('registry');

  app.set('bookshelf', bookshelf);
};