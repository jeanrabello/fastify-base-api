import { IModel } from "@src/shared/classes/IModel";

export interface FindUserByIdResponseModel extends IModel {
  id: string;
  username: string;
  email: string;
}
