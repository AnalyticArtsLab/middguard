var _ = require('lodash');
var path = require('path');

/**
 * Expose the main, logged in route.
 */

module.exports = function(req, res) {
  if (!req.session.user) {
    return res.redirect('/auth');
  }

  var js = [],
      css = [];

  req.bookshelf.collection('analytics')
  .each(function(module) {
    var requirePath = module.get('requirePath'),
        namespace = module.get('name'),
        required = require(requirePath);

    if (!_.has(required, 'visualization')) {
      return;
    }

    js = js.concat(required.js.map(file => path.join(namespace, file)));
    css = css.concat(required.css.map(file => path.join(namespace, file)));
  });

  res.render('index', {
    js: js,
    css: css,
    appJs: require('../config/app_js'),
    clientLibs: require('../config/client_libs'),
    user: {id: req.session.user.id, username: req.session.user.username}
  });
};
