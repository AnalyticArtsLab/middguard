'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('cyclist', function (table) {
    table.increments('id').primary();
    table.string('name');
    table.string('location');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('cyclist');
};
