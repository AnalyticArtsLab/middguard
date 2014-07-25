module.exports = function (db) {
  db.knex.schema.createTable('analysts', function (table) {
    table.increments('id').primary();
    table.text('username');
    table.text('password');
  });
};