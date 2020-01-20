import mongoose from 'mongoose';
import { verify } from 'jsonwebtoken';

import { jwtSecret } from '../../config';

const checkAuth = (req, res, next) => {
  const unauthorized = () => res.status(401).end();

  if (!req.headers.authorization) {
    return unauthorized();
  }

  const token = req.headers.authorization.split(' ')[1];

  verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return unauthorized();
    }

    const { sub: userId } = decoded;

    mongoose.model('User').findById(userId)
      .then((user) => {
        if (!user) {
          return unauthorized();
        } else {
          req.user = user;
          next();
        }
      })
      .catch(() => unauthorized())
    ;
  });
};

export default checkAuth;
