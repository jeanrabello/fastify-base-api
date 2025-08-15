import { IModel } from "@src/shared/classes/IModel";

export interface ListUsersPaginatedParamsModel extends IModel {
  page?: number;
  size?: number;
}
