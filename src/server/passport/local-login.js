const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;
const config = require('../../config');

module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, email, password, done) => {
  return User.findOne({ email: email.trim() }, (err, user) => {
    if (err) {
      return done({code: 'FORM_SUBMISSION_FAILED', info: err});
    }

    if (!user) {
      return done({code: 'INCORRECT_CREDENTIALS'});
    }

    return user.comparePassword(password.trim(), (passwordErr, isMatch) => {
      if (passwordErr) {
        return done({code: 'FORM_SUBMISSION_FAILED', info: passwordErr});
      }

      if (!isMatch) {
        return done({code: 'INCORRECT_CREDENTIALS'});
      }

      return done(null, jwt.sign({ sub: user._id }, config.jwtSecret), {
        email: user.email,
        name: user.name
      });
    });
  });
});
