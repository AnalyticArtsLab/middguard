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
app.module('hashtags-table', require.resolve('./hashtags-table'));
app.module('peek-table', require.resolve('./peek-table'));
app.module('hours-heatmap', require.resolve('./hours-heatmap'));
app.module('download-tweets-danarsilver',
  require.resolve('./download-tweets-danarsilver'));
app.module('download-tweets-jack', require.resolve('./download-tweets-jack'));
app.module('aggregate-time', require.resolve('./aggregate-time'));
app.module('difference', require.resolve('./difference'));
app.module('mean-difference', require.resolve('./mean-difference'));

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Listening on port %d...', port);
});
