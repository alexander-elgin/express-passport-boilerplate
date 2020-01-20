import express from 'express';
import cors  from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import morgan from 'morgan';
import passport from 'passport';

import config from './config';
import connect from './server/models';
import authRoutes from './server/routes/auth';
import authCheckMiddleware from './server/middleware/auth-check';
import getLocalSignupStrategy from './server/passport/local-signup';
import getLocalLoginStrategy from './server/passport/local-login';

connect(config.dbUri);

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.static('./server/static/'));
app.use(bodyParser.json());

const User = mongoose.model('User');
app.use(passport.initialize());
passport.use('local-signup', getLocalSignupStrategy(User));
passport.use('local-login', getLocalLoginStrategy(User));

app.use('/api', authCheckMiddleware);
app.use('/auth', authRoutes);

app.set('port', (process.env.PORT || 8000));
app.listen(app.get('port'), () => console.log(`Server is running on port ${app.get('port')}`));
