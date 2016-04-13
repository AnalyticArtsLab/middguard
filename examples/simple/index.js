var middguard = require('../..');

var app = middguard({
  // database
  'knex config': require('./knexfile'),

  // sessions
  'secret key': process.env.SECRET_KEY || 'major 🔑'
});

app.module('read-tweets', require.resolve('./read-tweets'));
app.module('count-hashtags', require.resolve('./count-hashtags'));
app.module('read-hashtags', require.resolve('./read-hashtags'));

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Listening on port %d...', port);
});
