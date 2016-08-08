exports.inputs = [];

exports.outputs = [];

exports.displayName = '<%- displayName %>';

/*
* change singleton to false to allow node to create a unique table.
* if the node has inputs, singleton should be true.
*/
exports.singleton = true;

exports.createTable = (tableName, knex) => {
  return knex.schema.createTable(tableName, (table) => {

  });
};

exports.handle = (context) => {

};
