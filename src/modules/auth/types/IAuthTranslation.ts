import { Translation } from "@src/shared/types/lang";

export interface IAuthTranslation extends Translation {
  auth: {
    signup: {
      success: string;
      emailAlreadyRegistered: string;
      usernameAlreadyRegistered: string;
      error: string;
    };
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
