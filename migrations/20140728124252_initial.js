'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('analyst', function (table) {
      table.increments('id').primary();
      table.text('username').unique();
      table.text('password');
    }),
    knex.schema.createTable('message', function (table) {
      table.increments('id').primary();
      table.integer('analyst_id').references('analyst.id');
      table.text('state');
      table.text('content');
      table.dateTime('timestamp');
    });
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('analyst')
                    .dropTable('message');
};
