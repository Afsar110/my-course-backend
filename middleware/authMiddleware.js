// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const sequelize = require('../db/postgress');

require('dotenv').config();

const authenticate = async (req, res, next) => {
  const {User} = sequelize.models;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let validUser;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Authorization header missing or invalid' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email) {
     validUser =   await User.findByPk(decoded.id);
    }
    if (validUser) {
      req.user = decoded; // attach user payload to request
      next();    
    }
    res.status(401).json({ message: 'Unauthorized, token invalid or expired' });

  
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ message: 'Unauthorized, token invalid or expired' });
  }
};

module.exports = authenticate;
