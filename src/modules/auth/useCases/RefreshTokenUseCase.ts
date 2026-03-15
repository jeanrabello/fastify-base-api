import { RefreshTokenResponseModel } from "@modules/auth/models/Response/RefreshTokenResponse.model";
import { IAuthService } from "@src/shared/types/services";
import CustomError from "@src/shared/classes/CustomError";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { IAuthTranslation } from "../types/IAuthTranslation";

interface IRefreshTokenUseCase {
  authService: IAuthService;
}

export class RefreshTokenUseCase implements IUseCase {
  private authService: IAuthService;

  constructor({ authService }: IRefreshTokenUseCase) {
    this.authService = authService;
  }

  async execute(refreshTokenData: string): Promise<RefreshTokenResponseModel> {
    if (!refreshTokenData) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    try {
      const decoded = this.authService.verifyRefreshToken(refreshTokenData);

      // Generate new tokens
      const payload = {
        id: decoded.id,
        email: decoded.email,
      };

      const accessToken = this.authService.generateToken(payload);
      const refreshToken = this.authService.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        expiresIn: this.authService.getTokenExpirationTime(),
      };
    } catch (error) {
      throw new CustomError<IAuthTranslation>(
        "auth.refreshToken.invalidToken",
        401,
      );
    }
  }
}
