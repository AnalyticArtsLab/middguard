module.exports = function (app) {
  var db = app.get('db');

  require('./analyst_schema')(db);
};