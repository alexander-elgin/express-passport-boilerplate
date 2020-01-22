import { Strategy as PassportLocalStrategy } from 'passport-local';
import {
  genSalt,
  hash,
} from 'bcryptjs';

const getStrategy = (db) => new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const salt = await genSalt();
    const hashCode = await hash(password.trim(), salt);

    await db('users').insert({
      email: email.trim(),
      name: req.body.name.trim(),
      password: hashCode,
    });

    done(null);
  } catch (e) {
    done(e);
  }
});

export default getStrategy;
