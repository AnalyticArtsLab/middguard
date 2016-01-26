module.exports = function (app) {
  var knex = require('knex')(app.get('knex config'));

  var Bookshelf = require('bookshelf')(knex);

  // Use named models to avoid circular import problems
  Bookshelf.plugin('registry');
  Bookshelf.plugin('visibility');

  var AnalyticsPackage = Bookshelf.Model.extend();
  var ModelPackage = Bookshelf.Model.extend();

  var AnalyticsRegister = Bookshelf.Collection.extend({
    model: AnalyticsPackage
  });
  var ModelRegister = Bookshelf.Collection.extend({
    model: ModelPackage
  });

  Bookshelf.model('AnalyticsPackage', AnalyticsPackage);
  Bookshelf.model('ModelPackage', ModelPackage);

  Bookshelf.collection('analytics', new AnalyticsRegister());
  Bookshelf.collection('models', new ModelRegister());

  app.use(function(req, res, next) {
    req.bookshelf = Bookshelf;
    next();
  });

  app.set('bookshelf', Bookshelf);

  require('../models/analyst')(app);
  require('../models/message')(app);
};
