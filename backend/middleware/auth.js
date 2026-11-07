const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'fallback_secret' || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return secret;
};

const auth = async (req, res, next) => {
  try {
    const authorization = req.header('Authorization') || '';
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ success: false, message: 'No valid bearer token provided' });
    }

    const decoded = jwt.verify(match[1], getJwtSecret(), { algorithms: ['HS256'] });
    if (!decoded.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive account' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.message && err.message.startsWith('JWT_SECRET')) {
      return res.status(500).json({ success: false, message: 'Authentication is not configured securely' });
    }
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

module.exports = { auth, requireRole, getJwtSecret };
