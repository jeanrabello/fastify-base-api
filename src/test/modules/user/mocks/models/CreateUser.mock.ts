import { CreateUserRequestModel } from "@modules/user/models/Request/CreateUserRequest.model";

export const validCreateUserModel: CreateUserRequestModel = {
  username: "New User",
  email: "new.user@yopmail.com",
};

export const invalidCreateUserModel: Partial<CreateUserRequestModel> = {
  username: "New User",
};
