import { IAuthTranslation } from "../types/IAuthTranslation";

const enUs: IAuthTranslation = {
  shared: {
    error: {
      invalidFields: "Invalid fields",
      requiredFields: "Required fields not filled",
      tokenExpired: "Token expired",
      tokenNotFound: "Token not found",
      internalServerError: "Internal server error",
      noMessageSpecified: "No message specified",
      invalidToken: "Invalid token",
      authorizationRequired: "Authorization required",
      invalidAuthorizationFormat: "Invalid authorization format",
      accessForbidden: "Access forbidden",
      tooManyRequests: "Too many requests, please wait a moment",
    },
  },
  auth: {
    signup: {
      success: "User registered successfully",
      emailAlreadyRegistered: "Email already registered",
      usernameAlreadyRegistered: "Username already registered",
      error: "Error registering user",
    },
    login: {
      success: "Login successful",
      invalidCredentials: "Invalid credentials",
      userNotFound: "User not found",
      error: "Login error",
    },
    validateToken: {
      success: "Valid token",
      invalidToken: "Invalid token",
      expiredToken: "Expired token",
      error: "Token validation error",
    },
    refreshToken: {
      success: "Token refreshed successfully",
      invalidToken: "Invalid refresh token",
      error: "Token refresh error",
    },
  },
};

export default enUs;
