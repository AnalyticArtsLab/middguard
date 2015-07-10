'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('tags', function (table) {
    table.increments('id').primary();
    table.text('tag');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tags');
};
