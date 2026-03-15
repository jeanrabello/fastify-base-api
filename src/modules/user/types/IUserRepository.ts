import { User } from "@src/shared/entities/user.entity";
import {
  PaginationParams,
  PaginatedResult,
} from "@src/shared/types/pagination";

export interface CreateUserInput {
  username: string;
  email: string;
}

export interface IUserRepository {
  save(newUser: CreateUserInput): Promise<Partial<User> | null>;
  findById(id: string): Promise<Partial<User> | null>;
  findByEmail(email: string): Promise<Partial<User> | null>;
  findByUsername(username: string): Promise<Partial<User> | null>;
  delete(id: string): Promise<boolean>;
  updateUserEmail(id: string, email: string): Promise<Partial<User> | null>;
  findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<Partial<User>>>;
}
