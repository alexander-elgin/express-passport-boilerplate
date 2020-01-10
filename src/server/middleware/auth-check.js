import { verify } from 'jsonwebtoken';

const checkAuth = (connection, { jwtSecret }) => (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).end();
  }

  const token = req.headers.authorization.split(' ')[1];

  verify(token, jwtSecret, (err, decoded) => {
    if (err) { return res.status(401).end(); }

    connection.query(`SELECT * FROM users WHERE _id = '${decoded.sub}'`, (userErr, rows) => {
      if (userErr || !rows.length) {
        return res.status(401).end();
      }

      req.user = rows.pop();
      next();
    });
  });
};

export default checkAuth;
