const request = require('supertest');
const Promise = require('bluebird');

const middguard = require('..');
const settings = require('./settings');
const knex = require('knex')(settings['knex config']);

function migrate() {
  return knex.migrate
  .latest({directory: `${__dirname}/../middguard/migrations`});
};

function createMiddguard() {
  return middguard(settings);
};

function login(app, username, password) {
  return request(app)
  .post('/auth/login')
  .send({username: username})
  .send({password: password});
};

exports.flow = function(username, password) {
  return migrate()
  .then(createMiddguard)
  .then(function(app) {
    return Promise.join(login(app, username, password), app);
  })
  .then(function(request, app) {
    console.log(request, app);
    return app;
  });
}
