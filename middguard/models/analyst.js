var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var db = require('../../app').get('db');

module.exports = db.Model.extend({
  tableName: 'analysts',
  initialize: function () {
    this.on('saving', this.validateSave);
  },
  compute
}, {
  login: Promise.method(function (username, password) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    return new this({username: username})
      .fetch({require: true})
      .tap(function (user) {
        return bcrypt.compareAsync(user.get('password'), password);
      });
  })
});