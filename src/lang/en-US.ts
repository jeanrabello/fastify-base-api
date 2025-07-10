import { Translation } from "../types/lang";

const enUs: Translation = {
  commom: {
    error: {
      requiredFields: "Required fields not filled",
      tokenExpired: "Token expired",
      tokenNotFound: "Token not found",
    },
  },
  user: {
    register: {
      create: {
        findUserByEmailOrUsernameError: "Username or email already registered",
      },
      active: {
        error: {
          findByCode: "Invalid activation code",
        },
      },
      email: {
        subject: "Welcome to the platform",},
    },
    createUser: {
      success: "User created successfully!",
      error: "Error creating user",
      emailAlreadyRegistered: "Email already registered",
    },
    findUser: {
      notFound: "User not found",
    },
  },
};

module.exports = enUs;
