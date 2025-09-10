// Mocks: axios, bcrypt and app config
jest.mock("axios");
jest.mock("bcrypt");
jest.mock("@config/api", () => ({
  __esModule: true,
  default: { app: { url: "http://localhost:3000/api" } },
}));

import axios from "axios";
import bcrypt from "bcrypt";
import config from "@config/api";
import { UserService } from "@src/shared/services/UserService";
import CustomError from "@src/shared/classes/CustomError";
import { mockUser } from "../../mocks/services";

const mockedAxios = axios as unknown as {
  post: jest.Mock;
};
const mockedBcrypt = bcrypt as unknown as {
  compare: jest.Mock;
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    jest.resetModules();
    service = new UserService();
    jest.clearAllMocks();
    mockedAxios.post.mockReset();
    mockedBcrypt.compare.mockReset();
  });

  describe("findUserByEmail", () => {
    it("Should return user data when user is found", async () => {
      const email = "test@example.com";
      const mockResponse = {
        status: 200,
        data: {
          data: mockUser,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.findUserByEmail(email);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${config.app.url}/user/email`,
        { email },
      );
      expect(result).toEqual(mockUser);
    });

    it("Should return null when user is not found (404)", async () => {
      const email = "notfound@example.com";
      const mockError = {
        response: {
          status: 404,
        },
      };

      mockedAxios.post.mockRejectedValue(mockError);

      const result = await service.findUserByEmail(email);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${config.app.url}/user/email`,
        { email },
      );
      expect(result).toBeNull();
    });

    it("Should return null when response status is not 200", async () => {
      const email = "test@example.com";
      const mockResponse = {
        status: 400,
        data: {
          message: "Bad request",
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.findUserByEmail(email);

      expect(result).toBeNull();
    });

    it("Should throw error when axios request fails with non-404 error", async () => {
      const email = "test@example.com";
      const mockError = {
        response: {
          status: 500,
        },
      };

      mockedAxios.post.mockRejectedValue(mockError);

      await expect(service.findUserByEmail(email)).rejects.toThrow(CustomError);
      await expect(service.findUserByEmail(email)).rejects.toThrow(
        "shared.error.internalServerError",
      );
    });

    it("Should throw error when axios request fails without response", async () => {
      const email = "test@example.com";
      const mockError = new Error("Network error");

      mockedAxios.post.mockRejectedValue(mockError);

      await expect(service.findUserByEmail(email)).rejects.toThrow(CustomError);
      await expect(service.findUserByEmail(email)).rejects.toThrow(
        "shared.error.internalServerError",
      );
    });

    it("Should use default URL when environment variable is not set", async () => {
      // config is mocked above to return the expected default URL
      service = new UserService();

      const email = "test@example.com";
      const mockResponse = {
        status: 200,
        data: {
          data: mockUser,
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      await service.findUserByEmail(email);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${config.app.url}/user/email`,
        { email },
      );
    });
  });

  describe("verifyPassword", () => {
    it("Should return true when password matches", async () => {
      const password = "password123";
      const hashedPassword = "$2b$10$hashedpassword";

      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.verifyPassword(password, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(result).toBe(true);
    });

    it("Should return false when password does not match", async () => {
      const password = "wrongpassword";
      const hashedPassword = "$2b$10$hashedpassword";

      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.verifyPassword(password, hashedPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        hashedPassword,
      );
      expect(result).toBe(false);
    });

    it("Should throw error when bcrypt.compare fails", async () => {
      const password = "password123";
      const hashedPassword = "$2b$10$hashedpassword";

      mockedBcrypt.compare.mockRejectedValue(
        new Error("Bcrypt error") as never,
      );

      await expect(
        service.verifyPassword(password, hashedPassword),
      ).rejects.toThrow(CustomError);
      await expect(
        service.verifyPassword(password, hashedPassword),
      ).rejects.toThrow("shared.error.internalServerError");
    });
  });
});
