var middguard = require('../..');

var app = middguard({
  // database
  'knex config': require('./knexfile'),

  // sessions
  'secret key': process.env.SECRET_KEY || 'major 🔑'
});

var port = process.env.PORT || 3000;
middguard.listen(port, function () {
  console.log('Listening on port %d...', port);
});
