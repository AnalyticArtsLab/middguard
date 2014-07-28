ar Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var db = require('../../app').get('db');

module.exports = db.Model.extend({
  tableName: 'analyst',
  initialize: function () {
    this.on('saving', this.validateSave);
    this.on('creating', this.hashPassword);
  },
  hashPassword: function () {
    this.get('password')
      .then(function (password) {
        return bcrypt.genSalt(10)
          .then(function (err, salt) {
            return bcrypt.hash(password, salt)
          })
          .then(function (err, hash) {
            return this.set('password', hash);
          }).done();
      });
  }
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