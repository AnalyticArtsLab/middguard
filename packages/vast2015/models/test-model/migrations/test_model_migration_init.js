'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('testTable', function (table) {
    table.increments('id').primary();
    table.text('first_name');
    table.text('last_name');
    table.text('country');
    table.text('ip_address');
    table.text('email');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('testTable');
};
