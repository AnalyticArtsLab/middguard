var middguard = require('../..');

// only setting really required
middguard.set('knex', require('./knexfile')[process.env.NODE_ENV]);

var port = process.env.PORT || 3000;
middguard.listen(port, function () {
  console.log('Listening on port %d...', port);
});
