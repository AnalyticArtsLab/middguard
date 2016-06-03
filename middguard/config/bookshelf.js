module.exports = function (app) {
  var knex = require('knex')(app.get('knex config'));

  var Bookshelf = require('bookshelf')(knex);

  // Use named models to avoid circular import problems
  Bookshelf.plugin('registry');
  Bookshelf.plugin('visibility');

  var AnalyticsModule = Bookshelf.Model.extend();
  Bookshelf.model('AnalyticsModule', AnalyticsModule);

  var AnalyticsRegister = Bookshelf.Collection.extend({
    model: AnalyticsModule
  });
  Bookshelf.collection('analytics', new AnalyticsRegister());

  app.use(function(req, res, next) {
    req.bookshelf = Bookshelf;
    next();
  });

  app.set('bookshelf', Bookshelf);

  require('../models/analyst')(app);
  require('../models/message')(app);
  require('../models/graph')(app);
  require('../models/node')(app);
  require('../models/connection')(app);
};
