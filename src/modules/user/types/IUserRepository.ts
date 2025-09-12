import { CreateUserRequestModel } from "@modules/user/models/Request/CreateUserRequest.model";
import { User } from "@src/shared/entities/user.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "@src/shared/types/pagination";

export interface IUserRepository {
  save(newUser: CreateUserRequestModel): Promise<Partial<User> | null>;
  findById(id: string): Promise<Partial<User> | null>;
  findByEmail(email: string): Promise<Partial<User> | null>;
  findByUsername(username: string): Promise<Partial<User> | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  updateUserEmail(id: string, email: string): Promise<Partial<User> | null>;
  findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<Partial<User>>>;
}
