module.exports = function (app) {
  var Bookshelf = app.get('bookshelf');

  var AnalyticsPackage = Bookshelf.Model.extend();
  var analyticsRegister = Bookshelf.Collection.extend({
    model: analyticsPackage;
  });

  Bookshelf.model('AnalyticsPackage', AnalyticsPackage);
  Bookshelf.collection('analytics', analyticsRegister);
};