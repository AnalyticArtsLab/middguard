var middguard = require('..');
var request = require('supertest');

describe('middguard', function() {
  it('should redirect to auth when logged out', function(done) {
    var app = middguard(require('./settings'));

    request(app)
    .get('/')
    .expect(302, done);
  });
});
