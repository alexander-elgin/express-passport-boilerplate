const express = require('express');
const validator = require('validator');
const passport = require('passport');

const router = new express.Router();

/**
 * Validate the sign up form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignUpForm(payload) {
  const errors = validateBasicSignInSignUpForm(payload);

  if (!payload || (typeof payload.name !== 'string') || !/^[a-zA-Z]+([\-\s]?[a-zA-Z]+)*$/.test(payload.name.trim())) {
    errors.name = {
      code: 'INVALID_NAME'
    };
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
    errors.password = {
      code: 'INVALID_PASSWORD'
    };
  }

  return errors;
}

/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignInForm(payload) {
  const errors = validateBasicSignInSignUpForm(payload);

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    errors.password = {
      code: 'EMPTY_PASSWORD'
    };
  }

  return errors;
}

function validateBasicSignInSignUpForm(payload) {
  const errors = {};

  if (!payload || typeof payload.email !== 'string' || !validator.isEmail(payload.email.trim())) {
    errors.email = {
      code: 'INVALID_EMAIL'
    };
  }

  return errors;
}

router.post('/signup', (req, res, next) => {
  const validationErrors = validateSignUpForm(req.body);

  if (Object.keys(validationErrors).length > 0) {
    return res.json({ errors: validationErrors });
  }

  return passport.authenticate('local-signup', (err) => {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // the 11000 Mongo code is for a duplication email error
        return res.json({
          errors: {
            email: 'DUPLICATED_EMAIL'
          }
        });
      }

      return res.json({
        errors: {
          '': 'FORM_SUBMISSION_FAILED'
        }
      });
    }

    return res.json({});
  })(req, res, next);
});

router.post('/signin', (req, res, next) => {
  const validationErrors = validateSignInForm(req.body);

  if (Object.keys(validationErrors).length > 0) {
    return res.json({ errors: validationErrors });
  }

  return passport.authenticate('local-login', (error, token, userData) => {
    if (error !== null) {
      return res.json({
        errors: {
          [error.code === 'INCORRECT_CREDENTIALS' ? 'password' : '']: error
        }
      });
    }

    return res.json({
      payload: {
        token,
        user: userData
      }
    });
  })(req, res, next);
});

module.exports = router;
