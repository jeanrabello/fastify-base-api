import { IModel } from "@src/shared/classes/IModel";

export interface VerifyUserCredentialsResponseModel extends IModel {
  isValid: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}
