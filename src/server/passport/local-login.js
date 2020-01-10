import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { Strategy as PassportLocalStrategy } from 'passport-local';

const getStrategy = (connection, { jwtSecret }) => new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, email, password, done) => {
  connection.query(`SELECT * FROM users WHERE email = '${email}'`, async (err, rows) => {
    if (err) {
      return done({code: 'FORM_SUBMISSION_FAILED', info: err});
    }

    if (!rows.length) {
      return done({code: 'INCORRECT_CREDENTIALS'});
    }

    const user = rows.pop();

    try {
      const matched = await compare(password, user.password);

      if (!matched) {
        return done({code: 'INCORRECT_CREDENTIALS'});
      }

      done(null, sign({ sub: user._id }, jwtSecret), {
        email: user.email,
        name: user.name
      });
    } catch (e) {
      done({code: 'FORM_SUBMISSION_FAILED', info: e});
    }
  });
});

export default getStrategy;
