import { Router } from 'express';
import Joi from 'joi';
import passport from 'passport';

const router = new Router();

/**
 * Validate the sign up form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignUpForm(payload) {
  const errors = validateBasicSignInSignUpForm(payload);

  if (!validate(Joi.string().pattern(/^[a-zA-Z]+([\-\s]?[a-zA-Z]+)*$/), payload.name)) {
    errors.name = {
      code: 'INVALID_NAME'
    };
  }

  if (!validate(Joi.string().min(8), payload.password)) {
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

  if (!validate(Joi.string().min(1), payload.password)) {
    errors.password = {
      code: 'EMPTY_PASSWORD'
    };
  }

  return errors;
}

function validateBasicSignInSignUpForm(payload) {
  const errors = {};

  if (!validate(Joi.string().email(), payload.email)) {
    errors.email = {
      code: 'INVALID_EMAIL'
    };
  }

  return errors;
}

/**
 * Validate value
 *
 * @param {object} schema - the validation schema
 * @param {string} value - the tested value
 * @returns {boolean} The result of validation
 *
 */
function validate(schema, value) {
  try {
    const { error } = schema.validate(value.trim());

    if (error !== undefined) {
      throw new Error(error);
    }
  } catch (e) {
    return false;
  }

  return true;
}

router.post('/signup', (req, res, next) => {
  const validationErrors = validateSignUpForm(req.body);

  if (Object.keys(validationErrors).length > 0) {
    return res.json({ errors: validationErrors });
  }

  return passport.authenticate('local-signup', (err) => {
    if (err) {
      const { field, code } = err.code === 'ER_DUP_ENTRY' && err.errno === 1062
          ? { field: 'email', code: 'DUPLICATED_EMAIL' }
          : { field: '', code: 'FORM_SUBMISSION_FAILED' };

      return res.json({
        errors: { [field]: { code } }
      });
    }

    res.json({});
  })(req, res, next);
});

router.post('/signin', (req, res, next) => {
  const validationErrors = validateSignInForm(req.body);

  if (Object.keys(validationErrors).length > 0) {
    return res.json({ errors: validationErrors });
  }

  return passport.authenticate('local-login', (error, token, user) => {
    if (error !== null) {
      return res.json({
        errors: {
          [error.code === 'INCORRECT_CREDENTIALS' ? 'password' : '']: error
        }
      });
    }

    res.json({
      payload: {
        token,
        user,
      },
    });
  })(req, res, next);
});

module.exports = router;
