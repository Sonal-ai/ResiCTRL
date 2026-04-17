import jwt from 'jsonwebtoken';
import prisma from '../configs/prismaClient.js';

/**
 * JWT Authentication middleware.
 * Security improvements:
 * - No fallback secret
 * - Differentiates expired vs invalid tokens
 * - Returns tokenExpired flag for frontend auto-logout
 */
export const protect = async (req, res, next) => {
  // 1. Extract token from cookie OR Authorization header
  let token = req.cookies?.jwt;

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('FATAL: JWT_SECRET is not set');
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, secret);

    // 2. Look up user from the correct table based on role stored in JWT
    let user = null;

    if (decoded.role === 'HOSTELLER') {
      user = await prisma.hosteller.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, roll_number: true }
      });
      if (user) user.role = 'HOSTELLER';
    } else {
      // WARDEN, ATTENDANT, or any admin role
      user = await prisma.admin.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true, designation: true }
      });
      if (user) user.role = user.designation; // WARDEN, ATTENDANT, etc.
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    // Differentiate between expired and invalid tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again',
        tokenExpired: true
      });
    }
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

// Decorator for RBAC
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route.`
      });
    }
    next();
  };
};
