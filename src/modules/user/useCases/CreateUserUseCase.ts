import { CreateUserRequestModel } from "@modules/user/models/Request/CreateUserRequest.model";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import { ICredentialRepository } from "@modules/auth/types/ICredentialRepository";
import CustomError from "@src/shared/classes/CustomError";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { User } from "@src/shared/entities/user.entity";
import { hashPassword } from "@src/shared/utils";
import { IUserTranslation } from "../types/IUserTranslation";

interface ICreateUserUseCase {
  userRepository: IUserRepository;
  credentialRepository: ICredentialRepository;
}

export class CreateUserUseCase implements IUseCase {
  private userRepository: IUserRepository;
  private credentialRepository: ICredentialRepository;

  constructor({ userRepository, credentialRepository }: ICreateUserUseCase) {
    this.userRepository = userRepository;
    this.credentialRepository = credentialRepository;
  }

  async execute(input: CreateUserRequestModel): Promise<Partial<User>> {
    if (!input || !input.email || !input.password || !input.username) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    const existingUserByEmail = await this.userRepository.findByEmail(
      input.email,
    );
    if (existingUserByEmail) {
      throw new CustomError<IUserTranslation>(
        "user.createUser.emailAlreadyRegistered",
        409,
      );
    }

    const existingUserByUsername = await this.userRepository.findByUsername(
      input.username,
    );
    if (existingUserByUsername) {
      throw new CustomError<IUserTranslation>(
        "user.createUser.usernameAlreadyRegistered",
        409,
      );
    }

    const createdUser = await this.userRepository.save({
      username: input.username,
      email: input.email,
    });

    if (!createdUser) {
      throw new CustomError<IUserTranslation>("user.createUser.error", 500);
    }

    const hashedPassword = await hashPassword(input.password);
    await this.credentialRepository.save({
      userId: createdUser.id!,
      email: input.email,
      secretData: hashedPassword,
    });

    return createdUser;
  }
}
