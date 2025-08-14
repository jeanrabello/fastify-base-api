import { IPaginatedModel } from "@src/shared/classes/IPaginatedModel";

export interface ListUsersPaginatedResponseModel
  extends IPaginatedModel<{
    id: string;
    username: string;
    email: string;
    createdAt: Date;
  }> {}
