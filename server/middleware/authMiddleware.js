const jwt = require('jsonwebtoken');
const User = require('../models/User');

// protect — token check කරනවා
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      res.status(401).json({ message: 'Token invalid' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'No token, access denied' });
  }
};

// adminOnly — admin role check
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

// managerOrAdmin — manager හෝ admin
const managerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(403).json({ message: 'Manager or Admin access only' });
  }
};

module.exports = { protect, adminOnly, managerOrAdmin };