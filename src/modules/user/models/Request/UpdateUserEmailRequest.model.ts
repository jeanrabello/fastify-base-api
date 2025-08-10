import { IModel } from "@src/shared/classes/IModel";

export interface UpdateUserEmailRequestModel extends IModel {
  email: string;
}
