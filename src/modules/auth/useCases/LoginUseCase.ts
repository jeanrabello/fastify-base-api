import { LoginResponseModel } from "@modules/auth/models/Response/LoginResponse.model";
import { IAuthService, IUserService } from "@modules/auth/types/IAuthService";
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

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new CustomError<IAuthTranslation>(
        "auth.login.invalidCredentials",
        401,
      );
    }

    const isPasswordValid = await this.userService.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
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
