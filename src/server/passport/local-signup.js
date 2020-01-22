import { Strategy as PassportLocalStrategy } from 'passport-local';
import {
  genSalt,
  hash,
} from 'bcryptjs';
import { promisify } from 'util';

const getStrategy = (connection) => new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const salt = await genSalt();
    const hashCode = await hash(password.trim(), salt);
    const values = [email.trim(), req.body.name.trim(), hashCode];
    const query = promisify(connection.query).bind(connection);
    await query(`INSERT INTO users ( email, name, password ) values ("${values.join('", "')}")`);
    done(null);
  } catch (e) {
    done(e);
  }
});

export default getStrategy;
