'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('person', function (table) {
    table.increments('id').primary();
    table.text('name');
    table.date('birthday');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('person');
};
