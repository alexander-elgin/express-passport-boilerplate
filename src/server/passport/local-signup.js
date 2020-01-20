import { Strategy as PassportLocalStrategy } from 'passport-local';

const getStrategy = (User) => new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, (req, email, password, done) => {
  const newUser = new User({
    email: email.trim(),
    password: password.trim(),
    name: req.body.name.trim()
  });

  newUser.save()
    .then(() => done(null))
    .catch((err) => done(err))
  ;
});

export default getStrategy;
