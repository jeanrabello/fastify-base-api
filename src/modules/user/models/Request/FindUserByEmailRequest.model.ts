import { IModel } from "@src/shared/classes/IModel";

export interface FindUserByEmailRequestModel extends IModel {
  email: string;
}
