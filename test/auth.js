const request = require('supertest');
const io = require('socket.io-client');

const fs = require('fs');

const middguard = require('..');
const settings = require('./settings');
const knex = require('knex')(settings['knex config']);

var app;

describe('middguard', function() {
  before(function(done) {
    knex.migrate.latest({directory: `${__dirname}/../middguard/migrations`})
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

  it('should redirect a logged in user to the investigation', function(done) {
    request(app)
    .post('/auth/login')
    .send({username: 'danasilver'})
    .send({password: 'key up'})
    .expect(302, done);
  });
});
