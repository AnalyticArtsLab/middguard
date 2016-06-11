const path = require('path');

module.exports = {
 client: 'sqlite3',
 connection: {
   filename: path.join(__dirname, 'simple.db')
 },
 pool: {
   min: 0,
   max: 1,
   afterCreate: function(conn, cb) {
     conn.run('PRAGMA foreign_keys = ON', cb);
   }
 }
};
