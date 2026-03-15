export interface IAuthService {
  generateToken(payload: any): string;
  verifyToken(token: string): any;
  generateRefreshToken(payload: any): string;
  verifyRefreshToken(token: string): any;
  getTokenExpirationTime(): number;
}
