import { IModel } from "@src/shared/classes/IModel";

export interface SignupRequestModel extends IModel {
  username: string;
  email: string;
  password: string;
}
