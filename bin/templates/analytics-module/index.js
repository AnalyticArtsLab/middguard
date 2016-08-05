exports.inputs = [];

exports.outputs = [];

exports.displayName = '<%- displayName %>';

exports.singleton = true; //change to false to allow node to create a unique table

exports.createTable = (tableName, knex) => {
  return knex.schema.createTable(tableName, (table) => {

  });
};

exports.handle = (context) => {

};
