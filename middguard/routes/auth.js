var Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcrypt')),
    Analyst = require('../models/analyst'),
    io = require('../../').get('io');

exports.index = function (req, res) {
  res.render('auth');
};

exports.register = function (req, res) {
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
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        new Analyst({username: req.body.username, password: hash})
        .save()
        .then(function (analyst) {
          io.sockets.emit('analysts:create', analyst);
          res.render('auth', {
            register: {message: 'Successfully registered!'}
          });
        })
        .catch(UniqueConstraintError, function (error) {
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

exports.login = function (req, res) {
  new Analyst({username: req.body.username}).fetch({require: true})
    .then(function (analyst) {
      return Promise.join(bcrypt.compareAsync(req.body.password, analyst.get('password')), analyst);
    })
    .spread(function (bcryptCheck, analyst) {
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
    .catch(Analyst.NotFoundError, function () {
      res.render('auth', {
        login: {
          username: req.body.username,
          error: 'User not found!'
        }
      });
    })
    .catch(function (error) {
      console.log(error);
    })
};

exports.logout = function (req, res) {
  req.session.destroy(function (err) {
    res.redirect('auth');
  });
};

function UniqueConstraintError (err) {
  if (!err) return false;
  var re = /UNIQUE constraint failed/;
  return re.test(err.message);
}
