const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

module.exports = { auth, requireRole };
