import { ValidateTokenResponseModel } from "@modules/auth/models/Response/ValidateTokenResponse.model";
import { IAuthService } from "@src/shared/types/services";
import CustomError from "@src/shared/classes/CustomError";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { IAuthTranslation } from "../types/IAuthTranslation";

interface IValidateTokenUseCase {
  authService: IAuthService;
}

export class ValidateTokenUseCase implements IUseCase {
  private authService: IAuthService;

  constructor({ authService }: IValidateTokenUseCase) {
    this.authService = authService;
  }

  async execute(token: string): Promise<ValidateTokenResponseModel> {
    if (!token) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    try {
      const decoded = this.authService.verifyToken(token);

      return {
        valid: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
        },
      };
    } catch (error) {
      throw new CustomError<IAuthTranslation>(
        "auth.validateToken.invalidToken",
        401,
      );
    }
  }
}
