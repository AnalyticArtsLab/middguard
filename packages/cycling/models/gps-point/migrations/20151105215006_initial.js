'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('gpspoint', function (table) {
    table.increments('id').primary();
    table.integer('cyclist_id').references('id').inTable('cyclist');
    table.float('latitude');
    table.float('longitude');
    table.float('elevation');
    table.dateTime('time');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('gpspoint');
};
