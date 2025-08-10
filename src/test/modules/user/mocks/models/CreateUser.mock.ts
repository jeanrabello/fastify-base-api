import { CreateUserModel } from "@modules/user/models/Request/CreateUserRequest.model";

export const validCreateUserModel: CreateUserModel = {
  username: "New User",
  email: "new.user@yopmail.com",
  password: "password123",
};

export const invalidCreateUserModel: Partial<CreateUserModel> = {
  username: "New User",
  email: "new.user@yopmail.com",
};
