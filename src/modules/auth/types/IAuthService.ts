import { User } from "@src/shared/entities/user.entity";

export interface IAuthService {
  generateToken(payload: any): string;
  verifyToken(token: string): any;
  generateRefreshToken(payload: any): string;
  verifyRefreshToken(token: string): any;
  getTokenExpirationTime(): number;
}

export interface IUserService {
  findUserByEmail(email: string): Promise<User | null>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}
