'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('test_table', function (table) {
    table.increments('id').primary();
    table.dateTime('timestamp');
    table.integer('person_id');
    table.text('type');
    table.integer('x');
    table.integer('y');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('test_table');
};
