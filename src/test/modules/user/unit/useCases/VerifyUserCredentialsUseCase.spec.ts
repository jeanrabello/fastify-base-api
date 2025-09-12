import { VerifyUserCredentialsUseCase } from "@modules/user/useCases/VerifyUserCredentialsUseCase";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import { User } from "@src/shared/entities/user.entity";
import CustomError from "@src/shared/classes/CustomError";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import bcrypt from "bcrypt";

// Mock bcrypt
jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("VerifyUserCredentialsUseCase", () => {
  let useCase: VerifyUserCredentialsUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser: User = {
    id: "user-id-123",
    username: "testuser",
    email: "test@example.com",
    password: "$2b$10$hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      delete: jest.fn(),
      updateUserEmail: jest.fn(),
      findPaginated: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    useCase = new VerifyUserCredentialsUseCase({ userRepository });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("Successful execution", () => {
    it("Should return valid credentials when email and password are correct", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await useCase.execute({
        email: "test@example.com",
        password: "password123",
      });

      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        "test@example.com",
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "$2b$10$hashedpassword",
      );
      expect(result).toEqual({
        isValid: true,
        user: {
          id: "user-id-123",
          username: "testuser",
          email: "test@example.com",
        },
      });
    });

    it("Should return isValid false when user is not found", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);

      const result = await useCase.execute({
        email: "notfound@example.com",
        password: "password123",
      });

      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        "notfound@example.com",
      );
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(result).toEqual({
        isValid: false,
      });
    });

    it("Should return isValid false when password is incorrect", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await useCase.execute({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        "test@example.com",
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "wrongpassword",
        "$2b$10$hashedpassword",
      );
      expect(result).toEqual({
        isValid: false,
      });
    });
  });

  describe("Input validation", () => {
    it("Should throw error when email is missing", async () => {
      await expect(
        useCase.execute({
          email: "",
          password: "password123",
        }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("shared.error.requiredFields", 400),
      );

      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it("Should throw error when password is missing", async () => {
      await expect(
        useCase.execute({
          email: "test@example.com",
          password: "",
        }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("shared.error.requiredFields", 400),
      );

      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it("Should throw error when email is null", async () => {
      await expect(
        useCase.execute({
          email: null as any,
          password: "password123",
        }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("shared.error.requiredFields", 400),
      );

      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it("Should throw error when password is null", async () => {
      await expect(
        useCase.execute({
          email: "test@example.com",
          password: null as any,
        }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("shared.error.requiredFields", 400),
      );

      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it("Should throw error when email is not a string", async () => {
      await expect(
        useCase.execute({
          email: 123 as any,
          password: "password123",
        }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("shared.error.requiredFields", 400),
      );

      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it("Should throw error when password is not a string", async () => {
      await expect(
        useCase.execute({
          email: "test@example.com",
          password: 123 as any,
        }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("shared.error.requiredFields", 400),
      );

      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it("Should throw error when email is whitespace only", async () => {
      await expect(
        useCase.execute({
          email: "   ",
          password: "password123",
        }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("shared.error.invalidFields", 400),
      );

      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it("Should throw error when password is whitespace only", async () => {
      await expect(
        useCase.execute({
          email: "test@example.com",
          password: "   ",
        }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("shared.error.invalidFields", 400),
      );

      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });
  });

  describe("Repository error handling", () => {
    it("Should propagate repository errors", async () => {
      const repositoryError = new Error("Database connection failed");
      userRepository.findByEmailWithPassword.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(repositoryError);

      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        "test@example.com",
      );
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it("Should handle bcrypt errors gracefully", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      const bcryptError = new Error("Bcrypt comparison failed");
      mockedBcrypt.compare.mockRejectedValue(bcryptError as never);

      await expect(
        useCase.execute({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(bcryptError);

      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        "test@example.com",
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "$2b$10$hashedpassword",
      );
    });
  });

  describe("Edge cases", () => {
    it("Should handle user without password field", async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      userRepository.findByEmailWithPassword.mockResolvedValue(
        userWithoutPassword as any,
      );

      await expect(
        useCase.execute({
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow();
    });

    it("Should trim whitespace from email and password", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await useCase.execute({
        email: "  test@example.com  ",
        password: "  password123  ",
      });

      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        "  test@example.com  ",
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "  password123  ",
        "$2b$10$hashedpassword",
      );
      expect(result.isValid).toBe(true);
    });

    it("Should not include password in response data", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await useCase.execute({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user).not.toHaveProperty("password");
      expect(result.user).not.toHaveProperty("createdAt");
      expect(result.user).not.toHaveProperty("updatedAt");
      expect(result.user).toEqual({
        id: "user-id-123",
        username: "testuser",
        email: "test@example.com",
      });
    });
  });
});
