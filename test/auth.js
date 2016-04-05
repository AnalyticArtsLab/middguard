const request = require('supertest');

const fs = require('fs');
const assert = require('assert');

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

  afterEach(function(done) {
    knex('analyst')
    .del()
    .then(() => done());
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

  it('should not login an unregistered user', function(done) {
    request(app)
    .post('/auth/login')
    .send({username: 'idontexist'})
    .send({password: 'test'})
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      const includedText = '<div class="error">User not found!</div>';
      assert.ok(res.text.indexOf(includedText) > -1);
      done();
    });
  });

  it('should redirect a logged in user to the investigation', function(done) {
    request(app)
    .post('/auth/register')
    .send({username: 'danasilver'})
    .send({password: 'key up'})
    .send({passwordConfirm: 'key up'})
    .expect(200)
    .end(function(err) {
      if (err) return done(err);

      request(app)
      .post('/auth/login')
      .send({username: 'danasilver'})
      .send({password: 'key up'})
      .expect(302, done);
    });
  });
});
