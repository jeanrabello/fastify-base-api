import { IAuthService } from "@modules/auth/types/IAuthService";

export const mockAuthService: jest.Mocked<IAuthService> = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  getTokenExpirationTime: jest.fn(),
} as any;

export const mockUserService = {
  findUserByEmail: jest.fn(),
  verifyPassword: jest.fn(),
};
