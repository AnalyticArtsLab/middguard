var _ = require('lodash'),
    Analyst = require('../models/analyst'),
    Message = require('../models/message');

exports.create = function (data, callback) {
  var socket = this;
  new Analyst({id: _.result(data, 'analyst_id')}).fetch()
    .then(function (analyst) {
      return analyst.messages().create(_.omit(data, 'analyst_id', 'seen'));
    })
    .then(function (message) {
      callback(null, message.toJSON());
      socket.broadcast.emit('messages:create', message.toJSON());
    })
    .catch(function (error) {
      console.log(error);
      callback(error);
    });
};

exports.readAll = function (data, callback) {
  Message.fetchAll({withRelated: ['analyst']})
    .then(function (messages) {
      callback(null, messages.toJSON());
    })
    .catch(function (error) {
      callback(error);
    });
};