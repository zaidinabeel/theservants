/**
 * ============================================
 * AUTHENTICATION UTILITIES
 * ============================================
 * Handles JWT token generation and verification
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * Generate JWT token for user
 * @param {object} user - User object with id, email, role
 * @returns {string} JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object|null} Decoded token or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null
 */
export function extractToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware to verify authentication
 * @param {Request} request - Next.js request object
 * @returns {object|null} User object or null
 */
export function authenticate(request) {
  const token = extractToken(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Check if user has required role
 * @param {object} user - User object with role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} True if user has required role
 */
export function hasRole(user, allowedRoles) {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}
