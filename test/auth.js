var middguard = require('..');
var settings = require('./settings');
var request = require('supertest');
var knex = require('knex')(settings['knex config']);
var fs = require('fs');

var app;

describe('middguard', function() {
  before(function(done) {
    knex.migrate.latest({databse: settings['knex config']})
    .spread(function(batchNo, log) {
      app = middguard(require('./settings'));
      done();
    });
  });

  after(function(done) {
    fs.unlink(settings['knex config'].connection.filename, done);
  });

  it('should redirect to auth when logged out', function(done) {
    request(app)
    .get('/')
    .expect(302, done);
  });

  it('should register a new user', function(done) {
    request(app)
    .post('/auth/register')
    .send({username: 'danasilver'})
    .send({password: 'key up'})
    .send({passwordConfirm: 'key up'})
    .expect(200, done);
  });
});
