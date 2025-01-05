import { Translation } from "../types/lang";

const enUs: Translation = {
  commom: {
    error: {
      requiredFields: "Required fields not filled",
    },
  },
  user: {
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
