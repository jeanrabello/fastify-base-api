import axios from "axios";
import bcrypt from "bcrypt";
import config from "@config/api";
import CustomError from "@src/shared/classes/CustomError";
import { User } from "@src/shared/entities/user.entity";
import { IUserService } from "@modules/auth/types/IAuthService";

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
}
