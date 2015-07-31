'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('testTable', function (table) {
    table.increments('id').primary();
    table.text('firstName');
    table.text('lastName');
    table.text('country');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('testTable');
};
