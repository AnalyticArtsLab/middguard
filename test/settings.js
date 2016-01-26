module.exports = {
  'knex config': {
    client: 'sqlite3',
    connection: {
      filename: 'middguard_test.db'
    },
    pool: {
      min: 0,
      max: 1,
      afterCreate: function(conn, cb) {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },
  'secret key': 'major 🔑'
};
