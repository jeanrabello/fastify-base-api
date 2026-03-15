import { SignupResponseModel } from "@modules/auth/models/Response/SignupResponse.model";
import { ICredentialRepository } from "@modules/auth/types/ICredentialRepository";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import CustomError from "@src/shared/classes/CustomError";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { hashPassword } from "@src/shared/utils";
import { IAuthTranslation } from "../types/IAuthTranslation";

interface ISignupUseCase {
  userRepository: IUserRepository;
  credentialRepository: ICredentialRepository;
}

export class SignupUseCase implements IUseCase {
  private userRepository: IUserRepository;
  private credentialRepository: ICredentialRepository;

  constructor({ userRepository, credentialRepository }: ISignupUseCase) {
    this.userRepository = userRepository;
    this.credentialRepository = credentialRepository;
  }

  async execute({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }): Promise<SignupResponseModel> {
    if (!username || !email || !password) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      throw new CustomError<IAuthTranslation>(
        "auth.signup.emailAlreadyRegistered",
        409,
      );
    }

    const existingUserByUsername =
      await this.userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new CustomError<IAuthTranslation>(
        "auth.signup.usernameAlreadyRegistered",
        409,
      );
    }

    const createdUser = await this.userRepository.save({ username, email });

    if (!createdUser) {
      throw new CustomError<IAuthTranslation>("auth.signup.error", 500);
    }

    const hashedPassword = await hashPassword(password);

    const createdCredential = await this.credentialRepository.save({
      userId: createdUser.id!,
      email,
      secretData: hashedPassword,
    });

    if (!createdCredential) {
      throw new CustomError<IAuthTranslation>("auth.signup.error", 500);
    }

    return {
      id: createdUser.id!,
      username: createdUser.username!,
      email: createdUser.email!,
    };
  }
}
