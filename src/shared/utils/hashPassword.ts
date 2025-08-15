import bcrypt from "bcrypt";
import config from "@src/config/api";

/**
 * Generates password hash using bcrypt
 * @param password - password as plain text
 * @returns Promise<string> - Hash of the password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcryptSaltRounds);
};

/**
 * Compares a plain text password with a hash
 * @param password - Plain text password
 * @param hash - Password hash
 * @returns Promise<boolean> - True if the password matches the hash
 */
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
