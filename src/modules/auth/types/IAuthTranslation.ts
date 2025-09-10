import { Translation } from "@src/shared/types/lang";

export interface IAuthTranslation extends Translation {
  auth: {
    login: {
      success: string;
      invalidCredentials: string;
      userNotFound: string;
      error: string;
    };
    validateToken: {
      success: string;
      invalidToken: string;
      expiredToken: string;
      error: string;
    };
    refreshToken: {
      success: string;
      invalidToken: string;
      error: string;
    };
  };
}
