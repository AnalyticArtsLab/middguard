/**
 * Module dependencies.
 */

var Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcrypt'));

/**
 * Logged out auth route.
 */

exports.index = function(req, res) {
  res.render('auth');
};

/**
 * Register a new user.
 */

exports.register = function(req, res) {
  var Analyst = req.bookshelf.model('Analyst');

  if (!req.body.username || !req.body.password || !req.body.passwordConfirm) {
    res.render('auth', {
      register: {
        username: req.body.username,
        error: 'All fields are required!'
      }
    });
  } else if (req.body.password !== req.body.passwordConfirm) {
    res.render('auth', {
      register: {
        username: req.body.username,
        error: 'Passwords do not match!'
      }
    });
  } else {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
        new Analyst({username: req.body.username, password: hash})
        .save()
        .then(function() {
          res.render('auth', {
            register: {message: 'Successfully registered!'}
          });
        })
        .catch(UniqueConstraintError, function() {
          res.render('auth', {
            register: {
              username: req.body.username,
              error: 'User already exists!'
            }
          });
        });
      });
    });
  }
};

/**
 * Login an existing user.
 */

exports.login = function(req, res) {
  var Analyst = req.bookshelf.model('Analyst');

  new Analyst({username: req.body.username}).fetch({require: true})
    .then(function(analyst) {
      return Promise.join(bcrypt.compareAsync(req.body.password, analyst.get('password')), analyst);
    })
    .spread(function(bcryptCheck, analyst) {
      if (bcryptCheck) {
        req.session.user = analyst;
        res.redirect('/');
      } else {
        res.render('auth', {
          login: {
            username: req.body.username,
            error: 'Invalid password!'
          }
        });
      }
    })
    .catch(Analyst.NotFoundError, function() {
      res.render('auth', {
        login: {
          username: req.body.username,
          error: 'User not found!'
        }
      });
    })
    .catch(function(error) {
      throw new Error(error);
    });
};

/**
 * Logout a logged in user.
 */

exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect('auth');
  });
};

function UniqueConstraintError(err) {
  if (!err) {
    return false;
  }

  var re = /UNIQUE constraint failed/;
  return re.test(err.message);
}
