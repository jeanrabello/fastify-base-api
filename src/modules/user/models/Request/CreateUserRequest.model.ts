import { IModel } from "@src/shared/classes/IModel";

export interface CreateUserRequestModel extends IModel {
  username: string;
  email: string;
  password: string;
}
