import { scryptSync } from "crypto";

export const STATIC_SALT = "12qwaszx";

/**
 * Encrypt password with given salt
 * @param password - Plain text password
 * @param salt - Salt for encryption
 * @returns Hashed password as hex string
 */
export const encryptPassword = (password: string, salt: string): string => {
  return scryptSync(password, salt, 32).toString("hex");
};

/**
 * Hash password with static salt
 * @param password - Plain text password
 * @returns Password hash
 */
export const hashPassword = (password: string): string => {
  return encryptPassword(password, STATIC_SALT);
};

/**
 * Match password against the stored hash
 * @param inputPassword - Plain text input password
 * @param storedHash - Stored password hash
 * @returns True if passwords match
 */
export const matchPassword = (
  inputPassword: string,
  storedHash: string,
): boolean => {
  const hashedInputPassword = encryptPassword(inputPassword, STATIC_SALT);
  return hashedInputPassword === storedHash;
};
