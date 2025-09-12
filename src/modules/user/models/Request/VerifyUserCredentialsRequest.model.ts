import { IModel } from "@src/shared/classes/IModel";

export interface VerifyUserCredentialsRequestModel extends IModel {
  email: string;
  password: string;
}
