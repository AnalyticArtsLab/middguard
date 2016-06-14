
var csv = require('csv');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

exports.inputs = [];

exports.outputs = [
  'computer',
  'user',
  'ssh',
  'start',
  'end'
];

exports.displayName = 'Load Last Data';

exports.createTable = (tableName, knex) => {
  return knex.schema.createTable(tableName, (table) => {
    table.string('computer');
    table.string('user');
    table.boolean('ssh');
    table.dateTime('start');
    table.dateTime('end');
  });
};

exports.handle = (context) => {
  var file = 'data/LabData.csv';

  fs.readFileAsync(file, 'utf8')
  .then(function(data) {
    csv.parse(data, {columns: true}, (err, data)=> {
      data.forEach((d) => {
        delete d.day;
        delete d.month;
        delete d.date;
        delete d.duration;
        d.ssh = d.ssh.toLowerCase();
      });

      // SQLite has a variable limit and knex builds multiple inserts into a
      // single insert with some unions, so we need to be break the data up
      // Second issue is that knex is using promises and the slices end up
      // overwriting each other
      // so I made a sequence of inserts that have to execute in order and
      // wait for the preceeding one to finish
      const CHUNK = 100;
      var sequence = Promise.resolve();
      for (let i = 0; i < data.length; i += CHUNK){
        let d = data.slice(i, i+CHUNK);
        sequence = sequence.then(() => context.table.knex.insert(d));
      }
      sequence.catch((err) => console.log(err));
    });
  })
  .catch((err) => console.log(err));
};
