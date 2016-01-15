'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('ride', function (table) {
    table.increments('id').primary();
    table.integer('cyclist_id').references('id').inTable('cyclist');
    table.string('name');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ride');
};
