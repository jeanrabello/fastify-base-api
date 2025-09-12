import { IModel } from "@src/shared/classes/IModel";

export interface ValidateTokenResponseModel extends IModel {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}
