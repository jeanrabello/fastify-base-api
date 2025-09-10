import { IModel } from "@src/shared/classes/IModel";

export interface LoginRequestModel extends IModel {
  email: string;
  password: string;
}
