var middguard = require('../../');

var port = process.env.PORT || 3000;
middguard.listen(port, function () {
  console.log('Listening on port %d...', port);
});
