const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const db = mongoose.connection.db;
      const users = db.collection('users');
      const user = await users.findOne(
        { _id: new mongoose.Types.ObjectId(decoded.id) }
      );
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({ message: 'Token invalid' });
    }
  }
  return res.status(401).json({ message: 'No token, access denied' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access only' });
};

const managerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    return next();
  }
  return res.status(403).json({ message: 'Manager or Admin access only' });
};

module.exports = { protect, adminOnly, managerOrAdmin };