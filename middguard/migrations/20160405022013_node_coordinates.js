'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('node', function(table) {
    table.integer('radius').defaultTo(75);

    // These are the top left coordinates of the node,
    // not the center coordinates.
    table.integer('position_x').defaultTo(0);
    table.integer('position_y').defaultTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('node', function(table) {
    table.dropColumns('radius', 'position_x', 'position_y');
  });
};
