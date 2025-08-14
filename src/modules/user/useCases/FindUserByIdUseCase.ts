import { IUseCase } from "@src/shared/classes/IUseCase";
import { IUserRepository } from "../types/IUserRepository";
import CustomError from "@src/shared/classes/CustomError";
import { User } from "@src/shared/entities/user.entity";

interface IFindUserByIdUseCase {
  userRepository: IUserRepository;
}

export class FindUserByIdUseCase implements IUseCase {
  private userRepository: IUserRepository;

  constructor({ userRepository }: IFindUserByIdUseCase) {
    this.userRepository = userRepository;
  }

  async execute(id: string): Promise<Partial<User> | null> {
    if (!id) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    const user = await this.userRepository.findById(id);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
