import { verify } from 'jsonwebtoken';

const checkAuth = (db, { jwtSecret }) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const { sub: UserId } = await verify(token, jwtSecret);
    const rows = await db('users').where({ _id: UserId });

    if (!rows.length) {
      throw new Error('Unauthorized');
    }

    req.user = rows.pop();
    next();
  } catch (e) {
    console.error(e);
    res.status(401).end();
  }
};

export default checkAuth;
