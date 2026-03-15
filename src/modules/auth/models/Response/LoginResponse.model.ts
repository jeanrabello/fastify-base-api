import { IModel } from "@src/shared/classes/IModel";

export interface LoginResponseModel extends IModel {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
