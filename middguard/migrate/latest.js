const _ = require('lodash');
const chalk = require('chalk');
const path = require('path');
const knex = require('knex');

module.exports = function(config) {
  config = _.defaults({directory: path.join(__dirname, 'migrations')}, config);

  return knex.migrate.latest(config)
  .spread(function(batchNo, log) {
    if (log.length === 0) {
      console.log(chalk.cyan('Already up to date'));
    } else {
      console.log(chalk.green(`Batch ${batchNo} run: ${log.length} migrations\n`));
      console.log(chalk.cyan(log.join('\n')));
    }
    process.exit(0);
  });
};
