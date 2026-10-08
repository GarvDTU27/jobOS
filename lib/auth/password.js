import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} plain - The plaintext password.
 * @returns {Promise<string>} The bcrypt hash.
 */
export async function hashPassword(plain) {
  if (typeof plain !== 'string') {
    throw new TypeError('Password must be a string');
  }
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 * @param {string} plain - The plaintext password.
 * @param {string} hash - The bcrypt hash.
 * @returns {Promise<boolean>} True if the password matches, false otherwise.
 */
export async function verifyPassword(plain, hash) {
  if (typeof plain !== 'string' || typeof hash !== 'string') {
    throw new TypeError('Both password and hash must be strings');
  }
  return bcrypt.compare(plain, hash);
}
