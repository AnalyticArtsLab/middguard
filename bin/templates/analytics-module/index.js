exports.inputs = [];

exports.outputs = [];

exports.displayName = '<%- displayName %>';

exports.createTable = (tableName, knex) => {
  return knex.schema.createTable(tableName, (table) => {

  });
};

exports.handle = (context) => {

};
