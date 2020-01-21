import { sign } from 'jsonwebtoken';
import { Strategy as PassportLocalStrategy } from 'passport-local';

import { jwtSecret } from '../../config';

const getStrategy = (User) => new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return done({code: 'INCORRECT_CREDENTIALS'});
    }

    const matched = await user.comparePassword(password.trim());

    if (!matched) {
      return done({code: 'INCORRECT_CREDENTIALS'});
    }

    done(null, sign({ sub: user._id }, jwtSecret), {
      email: user.email,
      name: user.name
    });
  } catch (e) {
    console.error(e);
    done({code: 'FORM_SUBMISSION_FAILED', info: e});
  }
});

export default getStrategy;
