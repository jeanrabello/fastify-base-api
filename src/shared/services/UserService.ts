import axios from "axios";
import bcrypt from "bcrypt";
import config from "@config/api";
import CustomError from "@src/shared/classes/CustomError";
import { User } from "@src/shared/entities/user.entity";
import { IUserService } from "@src/shared/types/services";

interface VerifyCredentialsResponse {
  isValid: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export class UserService implements IUserService {
  private readonly userServiceUrl: string;

  constructor() {
    this.userServiceUrl = `${config.app.url}/user`;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await axios.post(`${this.userServiceUrl}/email`, {
        email,
      });

      if (response.status === 200) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new CustomError("shared.error.internalServerError", 500);
    }
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: any) {
      throw new CustomError("shared.error.internalServerError", 500);
    }
  }

  async verifyUserCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    try {
      const response = await axios.post(`${this.userServiceUrl}/auth/verify`, {
        email,
        password,
      });

      if (response.status === 200) {
        const data: VerifyCredentialsResponse = response.data.data;

        if (data.isValid && data.user) {
          return {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            password: "",
          };
        }
      }

      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new CustomError("shared.error.internalServerError", 500);
    }
  }
}
