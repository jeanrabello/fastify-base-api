import { IModel } from "@src/shared/classes/IModel";

export interface UpdateUserEmailResponseModel extends IModel {
  id: string;
  username: string;
  email: string;
}
