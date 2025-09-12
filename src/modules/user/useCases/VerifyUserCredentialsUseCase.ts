import { IUserRepository } from "@modules/user/types/IUserRepository";
import CustomError from "@src/shared/classes/CustomError";
import bcrypt from "bcrypt";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { IUserTranslation } from "../types/IUserTranslation";

export interface IVerifyUserCredentialsUseCase {
  userRepository: IUserRepository;
}

export interface VerifyUserCredentialsInput {
  email: string;
  password: string;
}

export interface VerifyUserCredentialsResult {
  isValid: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export class VerifyUserCredentialsUseCase implements IUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: IVerifyUserCredentialsUseCase) {
    this.userRepository = userRepository;
  }

  async execute(
    input: VerifyUserCredentialsInput,
  ): Promise<VerifyUserCredentialsResult> {
    const { email, password } = input;

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      throw new CustomError<IUserTranslation>(
        "shared.error.requiredFields",
        400,
      );
    }

    if (!email.trim() || !password.trim()) {
      throw new CustomError<IUserTranslation>(
        "shared.error.invalidFields",
        400,
      );
    }

    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      return { isValid: false };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { isValid: false };
    }

    return {
      isValid: true,
      user: {
        id: user.id!,
        username: user.username,
        email: user.email,
      },
    };
  }
}
