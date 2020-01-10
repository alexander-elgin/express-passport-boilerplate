import express from 'express';
import cors  from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mysql from 'mysql';
import nodeCleanup from 'node-cleanup';
import passport from 'passport';

import config from './config';
import authRoutes from './server/routes/auth';
import authCheckMiddleware from './server/middleware/auth-check';
import getLocalSignupStrategy from './server/passport/local-signup';
import getLocalLoginStrategy from './server/passport/local-login';

const connection = mysql.createConnection({
    host: config.dbHost,
    database: config.dbName,
    password: config.dbPassword,
    user: config.dbUser,
});

connection.connect(err => {
    if (err) {
        console.error('An error occurred while connecting to the DB');
        throw err
    }
});

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.static('./server/static/'));
app.use(bodyParser.json());

app.use(passport.initialize());
passport.use('local-signup', getLocalSignupStrategy(connection));
passport.use('local-login', getLocalLoginStrategy(connection, config));

app.use('/api', authCheckMiddleware(connection, config));
app.use('/auth', authRoutes);

app.set('port', (process.env.PORT || 8000));
app.listen(app.get('port'), () => console.log(`Server is running on port ${app.get('port')}`));

const shutDown = (exitCode, signal) => {
    console.log(`\nThe server has been stopped with the exit code / signal ${exitCode || signal}`);
    connection.end();
};

nodeCleanup(shutDown);
