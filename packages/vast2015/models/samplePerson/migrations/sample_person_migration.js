'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('people_table', function (table) {
    table.increments('id').primary();
    table.text('first_name');
    table.text('last_name');
    table.text('email');
    table.text('country');
    table.text('ip_address');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('people_table');
};
