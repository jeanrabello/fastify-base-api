import CustomError from "@src/shared/classes/CustomError";
import { IUseCase } from "@src/shared/classes/IUseCase";
import { IUserRepository } from "../types/IUserRepository";

interface IDeleteUserByIdUseCase {
  userRepository: IUserRepository;
}

export class DeleteUserByIdUseCase implements IUseCase {
  private userRepository: IUserRepository;

  constructor({ userRepository }: IDeleteUserByIdUseCase) {
    this.userRepository = userRepository;
  }

  async execute(id: string): Promise<boolean> {
    if (!id) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    return !!(await this.userRepository.delete(id));
  }
}
