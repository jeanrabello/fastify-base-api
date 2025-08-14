import { IUserTranslation } from "../types/IUserTranslation";

const enUs: IUserTranslation = {
  shared: {
    error: {
      invalidFields: "Invalid fields",
      requiredFields: "Required fields not filled",
      tokenExpired: "Token expired",
      tokenNotFound: "Token not found",
      internalServerError: "Internal server error",
      noMessageSpecified: "No message specified",
    },
  },
  user: {
    createUser: {
      created: "User created successfully!",
      error: "Error creating user",
      emailAlreadyRegistered: "Email already registered",
    },
    findUser: {
      notFound: "User not found",
      found: "User found",
    },
    deleteUser: {
      deleted: "User deleted successfully",
      notFound: "User not found",
      error: "Error deleting user",
    },
    updateUserEmail: {
      notFound: "User not found",
      emailAlreadyRegistered: "Email already registered",
      error: "Error updating email",
      updated: "Email updated successfully",
    },
    listUsers: {
      success: "Users list retrieved successfully",
      error: "Error listing users",
    },
  },
};

export default enUs;
