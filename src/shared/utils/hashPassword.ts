import bcrypt from "bcrypt";
import config from "@src/config/api";

/**
 * Gera o hash da senha usando bcrypt
 * @param password - Senha em texto plano
 * @returns Promise<string> - Hash da senha
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcryptSaltRounds);
};

/**
 * Compara uma senha em texto plano com um hash
 * @param password - Senha em texto plano
 * @param hash - Hash da senha
 * @returns Promise<boolean> - True se a senha corresponder ao hash
 */
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
