import { LoginResponseModel } from "@modules/auth/models/Response/LoginResponse.model";
import { IAuthService, IUserService } from "@src/shared/types/services";
import CustomError from "@src/shared/classes/CustomError";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { IAuthTranslation } from "../types/IAuthTranslation";

interface ILoginUseCase {
  authService: IAuthService;
  userService: IUserService;
}

export class LoginUseCase implements IUseCase {
  private authService: IAuthService;
  private userService: IUserService;

  constructor({ authService, userService }: ILoginUseCase) {
    this.authService = authService;
    this.userService = userService;
  }

  async execute({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<LoginResponseModel> {
    if (!email || !password) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    const user = await this.userService.verifyUserCredentials(email, password);

    if (!user) {
      throw new CustomError<IAuthTranslation>(
        "auth.login.invalidCredentials",
        401,
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.username,
    };

    const accessToken = this.authService.generateToken(payload);
    const refreshToken = this.authService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.authService.getTokenExpirationTime(),
      user: {
        id: user.id!,
        email: user.email,
        name: user.username,
      },
    };
  }
}
