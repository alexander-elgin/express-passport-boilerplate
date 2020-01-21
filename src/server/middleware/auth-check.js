import mongoose from 'mongoose';
import { verify } from 'jsonwebtoken';
import { promisify } from 'util';

import { jwtSecret } from '../../config';

const checkAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new Error('Unauthorized');
    }

    const token = req.headers.authorization.split(' ')[1];
    const decoded = await promisify(verify)(token, jwtSecret);
    const { sub: userId } = decoded;
    const user = await mongoose.model('User').findById(userId);

    if (!user) {
      throw new Error('Unauthorized');
    }

    req.user = user;
    next();
  } catch (e) {
    res.status(401).end();
  }
};

export default checkAuth;
