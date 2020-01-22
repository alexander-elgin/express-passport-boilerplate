import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { Strategy as PassportLocalStrategy } from 'passport-local';
import { promisify } from 'util';

const getStrategy = (connection, { jwtSecret }) => new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const rows = await promisify(connection.query).bind(connection)(`SELECT * FROM users WHERE email = '${email}'`);

    if (!rows.length) {
      return done({code: 'INCORRECT_CREDENTIALS'});
    }

    const user = rows.pop();
    const matched = await compare(password, user.password);

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
