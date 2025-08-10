import { CreateUserRequestModel } from "@modules/user/models/Request/CreateUserRequest.model";
import { User } from "@src/shared/entities/user.entity";

export interface IUserRepository {
  save(newUser: CreateUserRequestModel): Promise<Partial<User> | null>;
  findById(id: string): Promise<Partial<User> | null>;
  findByEmail(email: string): Promise<Partial<User> | null>;
  delete(id: string): Promise<boolean>;
  updateUserEmail(id: string, email: string): Promise<Partial<User> | null>;
}
