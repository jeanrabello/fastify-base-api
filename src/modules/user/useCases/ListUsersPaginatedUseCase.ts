import { IUseCase } from "@src/shared/classes/IUseCase";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import {
  PaginatedResult,
  PaginationParams,
} from "@src/shared/types/pagination";
import { User } from "@src/shared/entities/user.entity";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import CustomError from "@src/shared/classes/CustomError";

interface IListUsersUseCaseDeps {
  userRepository: IUserRepository;
}

export class ListUsersPaginatedUseCase implements IUseCase {
  private userRepository: IUserRepository;

  constructor({ userRepository }: IListUsersUseCaseDeps) {
    this.userRepository = userRepository;
  }

  async execute(
    params: PaginationParams,
  ): Promise<PaginatedResult<Partial<User>>> {
    const result = await this.userRepository.findPaginated(params);
    if (!result) {
      throw new CustomError<IUserTranslation>("user.listUsers.error", 500);
    }
    return result;
  }
}
