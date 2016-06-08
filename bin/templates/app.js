const middguard = require('<%- middguardPath %>');

let app = middguard({
  'knex config': require('./knexfile'),
  'secret key': process.env.SECRET_KEY || '<%- secretKey %>'
});

// Add your modules here.
app.module('module-name', require.resolve('./local-module'));
app.module('module-name', 'npm-installed-module');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
