'use strict';

exports.up = function(knex) {
  return knex.schema.createTable('analyst', function(table) {
    table.increments('id').primary();
    table.text('username').unique();
    table.text('password');
  })
  .createTable('message', function(table) {
    table.increments('id').primary();
    table.integer('analyst_id').references('analyst.id');
    table.text('state');
    table.text('content');
    table.dateTime('timestamp');
  })
  .createTable('graph', function(table) {
    table.increments('id').primary();
    table.string('name');
  })
  .createTable('node', function(table) {
    table.increments('id').primary();
    table.integer('graph_id').references('graph.id');
    table.string('module');
    table.string('table');
    table.integer('status').defaultTo(0);
    table.string('connections').defaultTo('{}');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('analyst')
                    .dropTable('message')
                    .dropTable('graph')
                    .dropTable('node')
                    .dropTable('connection');
};
