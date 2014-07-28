'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('analyst', function (table) {
    table.increments('id').primary();
    table.text('username');
    table.text('password');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('analyst');
};
