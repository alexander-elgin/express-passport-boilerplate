import { verify } from 'jsonwebtoken';
import { promisify } from 'util';

const checkAuth = (connection, { jwtSecret }) => async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = await verify(token, jwtSecret);
    const rows = await promisify(connection.query).bind(connection)(`SELECT * FROM users WHERE _id = '${decoded.sub}'`);

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
