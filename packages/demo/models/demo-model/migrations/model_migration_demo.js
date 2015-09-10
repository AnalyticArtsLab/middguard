'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('demoTable', function (table) {
    table.increments('pid').primary();
    table.dateTime('timestamp');
    table.integer('x');
    table.integer('y');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('demoTable');
};
