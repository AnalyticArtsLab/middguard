'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('analyst', function (table) {
      table.increments('id').primary();
      table.text('username').unique();
      table.text('password');
    }),
    knex.schema.createTable('message', function (table) {
      table.increments('id').primary();
      table.integer('analyst_id').references('analyst.id');
      table.text('state');
      table.text('content');
      table.dateTime('timestamp');
    }),
    knex.schema.createTable('graph', function(table) {
      table.increments('id').primary();
      table.string('name');
    }),
    knex.schema.createTable('node', function(table) {
      table.increments('id').primary();
      table.integer('graph_id').reference('graph.id');
      table.string('module');
      table.string('table');
      table.integer('status');
    }),
    knex.schema.createTable('connection', function (table) {
      table.increments('id').primary();
      table.integer('in').references('node.id');
      table.integer('out').references('node.id');
      table.string('connections');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('analyst')
                    .dropTable('message')
                    .dropTable('connection');
};
