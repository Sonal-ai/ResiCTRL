import jwt from 'jsonwebtoken';

/**
 * Generate JWT and set httpOnly cookie.
 * Security improvements:
 * - No fallback secret — crashes on missing JWT_SECRET (fail-safe)
 * - 7-day expiry (reduced from 30d)
 * - Strict cookie flags in production
 */
export const generateToken = (res, userId, role, name = '') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('FATAL: JWT_SECRET environment variable is not set');

  const token = jwt.sign(
    { userId, role, name, designation: role },
    secret,
    { expiresIn: '7d' }
  );

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};
