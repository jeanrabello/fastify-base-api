import { IModel } from "@src/shared/classes/IModel";

export interface SignupResponseModel extends IModel {
  id: string;
  username: string;
  email: string;
}
