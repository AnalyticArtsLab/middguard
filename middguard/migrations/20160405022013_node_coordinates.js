'use strict';

exports.up = function(knex) {
  return knex.schema.table('node', function(table) {
    console.log('im in here');
    table.integer('width').defaultTo(190);
    table.integer('height').defaultTo(50);

    // These are the top left coordinates of the node,
    // not the center coordinates.
    table.integer('position_x').defaultTo(0);
    table.integer('position_y').defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.table('node', function(table) {
    table.dropColumns('width', 'height', 'position_x','position_y');
  });
};
