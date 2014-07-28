var Analyst = require('../models/analyst');

exports.create = function (data, callback) {
  var username = data.username;
  var password = data.password;
  var passwordConfirm = data.passwordConfirm;

  if (password !== passwordConfirm) {
    var message = {error: {message: 'Passwords do not match.'}}
    callback(null, message);
    return false;
  }

  var analyst = new Analyst({username: username, password: password}).save();

  callback(null, analyst.toJSON());
  this.broadcast.emit('analysts:create', analyst.toJSON());
};

