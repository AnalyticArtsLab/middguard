'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('analyst', function (table) {
      table.increments('id').primary();
      table.text('username');
      table.text('password');
    }),
    knex.schema.createTable('message', function (table) {
      table.increments('id').primary();
      table.integer('analyst_id').references('analyst.id');
      table.text('state');
      table.text('content');
      table.dateTime('timestamp');
    }),
    knex.schema.createTable('relationship', function (table) {
      table.increments('id').primary();
      table.integer('id_1');
      table.integer('id_2');
      table.text('type_1');
      table.text('type_2');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('analyst')
                    .dropTable('message')
                    .dropTable('relationship');
};
