import jwt, { SignOptions } from "jsonwebtoken";
import CustomError from "@src/shared/classes/CustomError";
import config from "@config/api";
import { IAuthService } from "@modules/auth/types/IAuthService";

export class JWTAuthService implements IAuthService {
  generateToken(payload: any): string {
    return jwt.sign(payload, config.jwt.tokenSecret, {
      expiresIn: config.jwt.tokenExpiresIn,
    } as SignOptions);
  }

  verifyToken(token: string): any {
    try {
      if (token.includes("Bearer ")) token = token.split(" ")[1];
      return jwt.verify(token, config.jwt.tokenSecret);
    } catch (error: any) {
      throw new CustomError("shared.error.invalidToken", 401);
    }
  }

  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, config.jwt.refreshTokenSecret, {
      expiresIn: config.jwt.refreshTokenExpiresIn,
    } as SignOptions);
  }

  verifyRefreshToken(token: string): any {
    try {
      if (token.includes("Bearer ")) token = token.split(" ")[1];
      return jwt.verify(token, config.jwt.refreshTokenSecret);
    } catch (error: any) {
      throw new CustomError("shared.error.invalidToken", 401);
    }
  }

  getTokenExpirationTime(): number {
    // Return expiration time in seconds (15 minutes = 900 seconds)
    const expiresIn = config.jwt.tokenExpiresIn;
    if (expiresIn.endsWith("m")) {
      const minutes = parseInt(expiresIn.slice(0, -1));
      return isNaN(minutes) ? 900 : minutes * 60;
    }
    if (expiresIn.endsWith("h")) {
      const hours = parseInt(expiresIn.slice(0, -1));
      return isNaN(hours) ? 900 : hours * 3600;
    }
    if (expiresIn.endsWith("d")) {
      const days = parseInt(expiresIn.slice(0, -1));
      return isNaN(days) ? 900 : days * 86400;
    }
    return 900; // Default 15 minutes
  }
}
