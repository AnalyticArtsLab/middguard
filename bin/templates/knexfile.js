// These are some examples of database configurations
// for development, staging, and production. All databases
// are supported in all environments.
// Update with your config settings.

// See http://knexjs.org/#Installation-client for all options.

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './middguard.sqlite3'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
