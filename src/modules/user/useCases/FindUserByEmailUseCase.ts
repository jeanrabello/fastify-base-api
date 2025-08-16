import { IUserRepository } from "@modules/user/types/IUserRepository";
import { User } from "@src/shared/entities/user.entity";
import CustomError from "@src/shared/classes/CustomError";

export interface IFindUserByEmailUseCase {
  userRepository: IUserRepository;
}

export class FindUserByEmailUseCase {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: IFindUserByEmailUseCase) {
    this.userRepository = userRepository;
  }

  async execute(email?: string): Promise<User | null> {
    if (!email || typeof email !== "string" || !email.trim()) {
      throw new CustomError("shared.error.invalidFields", 400);
    }
    return this.userRepository.findByEmailWithPassword(email);
  }
}
