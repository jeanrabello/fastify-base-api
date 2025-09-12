import { IModel } from "@src/shared/classes/IModel";

export interface RefreshTokenResponseModel extends IModel {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
