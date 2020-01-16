const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan  = require('morgan');
const passport = require('passport');
const config = require('./config');

// connect to the database and load models
require('./server/models').connect(config.dbUri);

const app = express();
app.use(morgan('dev'));
app.use(cors());
// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));
// tell the app to parse HTTP body messages
app.use(bodyParser.json());
// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./server/passport/local-signup');
const localLoginStrategy = require('./server/passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authenticaion checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);

// routes
app.use('/auth', require('./server/routes/auth'));

// Set Port, hosting services will look for process.env.PORT
app.set('port', (process.env.PORT || 8000));

// start the server
app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${app.get('port')}`);
});
