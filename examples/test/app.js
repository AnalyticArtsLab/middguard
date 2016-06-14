const middguard = require('../..');

let app = middguard({
  'knex config': require('./knexfile'),
  'secret key': process.env.SECRET_KEY || 'keepmesecret'
});

// Add your modules here.
app.module('load-last-data', require.resolve('./load-last-data'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
