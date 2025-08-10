import { IModel } from "@src/shared/classes/IModel";

export interface FindUserByIdRequestModel extends IModel {
  id?: string;
}
