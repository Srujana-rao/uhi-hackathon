// backend/src/modules/auth/auth.service.js
// Service layer for auth-related business logic.
// Currently minimal, but ready for future expansion.

const User = require('../../db/models/User');
const bcrypt = require('bcryptjs');

/**
 * Find a user by email.
 */
async function findUserByEmail(email) {
  return await User.findOne({ email });
}

/**
 * Verify that a plaintext password matches a stored bcrypt hash.
 */
async function verifyPassword(plain, hash) {
  return await bcrypt.compare(plain, hash);
}

/**
 * Hash a plaintext password (for future "create user" admin flows).
 */
async function hashPassword(plain) {
  return await bcrypt.hash(plain, 10);
}

module.exports = {
  findUserByEmail,
  verifyPassword,
  hashPassword,
};
