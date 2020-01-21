import { Strategy as PassportLocalStrategy } from 'passport-local';

const getStrategy = (User) => new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, async (req, email, password, done) => {
  const newUser = new User({
    email: email.trim(),
    password: password.trim(),
    name: req.body.name.trim(),
  });

  try {
    await newUser.save();
    done(null);
  } catch (err) {
    console.error(err);
    done(err);
  }
});

export default getStrategy;
