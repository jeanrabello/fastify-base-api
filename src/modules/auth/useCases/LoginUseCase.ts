import { LoginResponseModel } from "@modules/auth/models/Response/LoginResponse.model";
import { IAuthService } from "@src/shared/types/services";
import { ICredentialRepository } from "@modules/auth/types/ICredentialRepository";
import CustomError from "@src/shared/classes/CustomError";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { IAuthTranslation } from "../types/IAuthTranslation";
import { comparePassword } from "@src/shared/utils";

interface ILoginUseCase {
  authService: IAuthService;
  credentialRepository: ICredentialRepository;
}

export class LoginUseCase implements IUseCase {
  private authService: IAuthService;
  private credentialRepository: ICredentialRepository;

  constructor({ authService, credentialRepository }: ILoginUseCase) {
    this.authService = authService;
    this.credentialRepository = credentialRepository;
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

    const credential = await this.credentialRepository.findByEmail(email);

    if (!credential) {
      throw new CustomError<IAuthTranslation>(
        "auth.login.invalidCredentials",
        401,
      );
    }

    const isPasswordValid = await comparePassword(
      password,
      credential.secretData,
    );

    if (!isPasswordValid) {
      throw new CustomError<IAuthTranslation>(
        "auth.login.invalidCredentials",
        401,
      );
    }

    const payload = {
      id: credential.userId,
      email: credential.email,
    };

    const accessToken = this.authService.generateToken(payload);
    const refreshToken = this.authService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.authService.getTokenExpirationTime(),
    };
  }
}
