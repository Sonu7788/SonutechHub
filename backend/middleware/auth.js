import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'javadsa_secret_key_2026_super_secure';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Account required. Please log in to run tests, submit code, or access this feature.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to token no longer exists.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        message: 'Your account has been suspended/blocked from practice by the administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired session token.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isBlocked) {
        req.user = user;
      }
    }
  } catch (error) {
    // Continue without user
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access forbidden: Admin privileges required.' });
  }
  next();
};

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d'
  });
};
