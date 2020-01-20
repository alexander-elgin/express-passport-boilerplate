import { sign } from 'jsonwebtoken';
import { Strategy as PassportLocalStrategy } from 'passport-local';

import { jwtSecret } from '../../config';

const getStrategy = (User) => new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, email, password, done) => {
  try {
    User.findOne({ email: email.trim() })
      .then((user) => {
        if (!user) {
          return done({code: 'INCORRECT_CREDENTIALS'});
        }

        user.comparePassword(password.trim())
          .then((matched) => {
            if (!matched) {
              return done({code: 'INCORRECT_CREDENTIALS'});
            }

            done(null, sign({ sub: user._id }, jwtSecret), {
              email: user.email,
              name: user.name
            });
          })
          .catch((err) => done({code: 'FORM_SUBMISSION_FAILED', info: err}))
        ;
      })
      .catch((err) => done({code: 'FORM_SUBMISSION_FAILED', info: err}))
    ;
  } catch (e) {
    console.error(e);
    done({code: 'FORM_SUBMISSION_FAILED', info: e});
  }
});

export default getStrategy;
