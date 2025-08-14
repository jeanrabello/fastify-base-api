import { CreateUserRequestModel } from "@modules/user/models/Request/CreateUserRequest.model";
import { User } from "@src/shared/entities/user.entity";

export const makeFindUserByEmailRepository = () => ({
  execute: jest.fn<Promise<User | null>, [string]>(),
});

export const makeCreateUserRepository = () => ({
  execute: jest.fn<Promise<User | null>, [CreateUserRequestModel]>(),
});
