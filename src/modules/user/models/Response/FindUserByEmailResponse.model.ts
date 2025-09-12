import { IModel } from "@src/shared/classes/IModel";

export interface FindUserByEmailResponseModel extends IModel {
  id: string;
  username: string;
  email: string;
}
