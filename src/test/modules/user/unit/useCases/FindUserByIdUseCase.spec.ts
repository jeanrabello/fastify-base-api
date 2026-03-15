import { IUserRepository } from "@modules/user/types/IUserRepository";
import { FindUserByIdUseCase } from "@modules/user/useCases/FindUserByIdUseCase";
import { existingUser } from "../../mocks/entities";
import CustomError from "@src/shared/classes/CustomError";
import { User } from "@src/shared/entities/user.entity";

describe("FindUserByIdUseCase", () => {
  let useCase: FindUserByIdUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findPaginated: jest.fn(),
      updateUserEmail: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    useCase = new FindUserByIdUseCase({ userRepository });
  });

  describe("Successful execution", () => {
    it("Should return partial user data when user is found", async () => {
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      };

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.execute(existingUser.id!);

      expect(userRepository.findById).toHaveBeenCalledWith(existingUser.id);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      });

      expect(result).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
    });

    it("Should return null when user is not found", async () => {
      const validId = "nonexistent123";
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(validId);

      expect(userRepository.findById).toHaveBeenCalledWith(validId);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("Input validation", () => {
    it("Should throw error when id is null", async () => {
      await expect(useCase.execute(null as any)).rejects.toEqual(
        new CustomError("shared.error.requiredFields", 400),
      );

      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it("Should throw error when id is undefined", async () => {
      await expect(useCase.execute(undefined as any)).rejects.toEqual(
        new CustomError("shared.error.requiredFields", 400),
      );

      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it("Should throw error when id is empty string", async () => {
      await expect(useCase.execute("")).rejects.toEqual(
        new CustomError("shared.error.requiredFields", 400),
      );

      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it("Should process whitespace-only id (truthy but likely invalid)", async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute("   ");

      expect(userRepository.findById).toHaveBeenCalledWith("   ");
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("Repository interaction", () => {
    it("Should call repository with correct parameters", async () => {
      const validId = "validUserId123";
      userRepository.findById.mockResolvedValue(null);

      await useCase.execute(validId);

      expect(userRepository.findById).toHaveBeenCalledWith(validId);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("Should handle repository errors gracefully", async () => {
      const validId = "validUserId123";
      const repositoryError = new Error("Database connection failed");
      userRepository.findById.mockRejectedValue(repositoryError);

      await expect(useCase.execute(validId)).rejects.toThrow(repositoryError);

      expect(userRepository.findById).toHaveBeenCalledWith(validId);
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe("Data filtering", () => {
    it("Should only return id, username, and email fields", async () => {
      const mockUserWithAllFields: Partial<User> = {
        id: "user123",
        username: "testuser",
        email: "test@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(mockUserWithAllFields);

      const result = await useCase.execute("user123");

      expect(result).toEqual({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
      });

      expect(Object.keys(result || {})).toEqual(["id", "username", "email"]);
      expect(Object.keys(result || {})).not.toContain("password");
      expect(Object.keys(result || {})).not.toContain("createdAt");
      expect(Object.keys(result || {})).not.toContain("updatedAt");
    });

    it("Should handle user object without optional fields", async () => {
      const mockMinimalUser: Partial<User> = {
        id: "user123",
        username: "testuser",
        email: "test@example.com",
      };

      userRepository.findById.mockResolvedValue(mockMinimalUser);

      const result = await useCase.execute("user123");

      expect(result).toEqual({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
      });
    });
  });
});
