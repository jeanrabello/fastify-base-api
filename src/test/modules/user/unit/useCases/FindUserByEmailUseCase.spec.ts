import { FindUserByEmailUseCase } from "@modules/user/useCases/FindUserByEmailUseCase";
import { User } from "@src/shared/entities/user.entity";
import CustomError from "@src/shared/classes/CustomError";
import { IUserRepository } from "@modules/user/types/IUserRepository";

describe("FindUserByEmailUseCase", () => {
  let useCase: FindUserByEmailUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser: Partial<User> = {
    id: "1",
    username: "testuser",
    email: "test@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      delete: jest.fn(),
      updateUserEmail: jest.fn(),
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    useCase = new FindUserByEmailUseCase({ userRepository });
  });

  describe("Successful execution", () => {
    it("Should return user when found (without password)", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      const result = await useCase.execute(mockUser.email!);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty("password");
    });

    it("Should return null when user not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const email = "notfound@example.com";
      const result = await useCase.execute(email);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "notfound@example.com",
      );
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("Input validation", () => {
    it("Should throw error when email is null", async () => {
      await expect(useCase.execute(null as any)).rejects.toEqual(
        new CustomError("shared.error.invalidFields", 400),
      );
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("Should throw error when email is undefined", async () => {
      await expect(useCase.execute(undefined as any)).rejects.toEqual(
        new CustomError("shared.error.invalidFields", 400),
      );
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("Should throw error when email is empty string", async () => {
      await expect(useCase.execute("")).rejects.toEqual(
        new CustomError("shared.error.invalidFields", 400),
      );
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("Should throw error when email is whitespace-only", async () => {
      await expect(useCase.execute("   ")).rejects.toEqual(
        new CustomError("shared.error.invalidFields", 400),
      );
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe("Repository interaction", () => {
    it("Should call repository with correct parameters", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const email = "valid@email.com";
      await useCase.execute(email);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    });

    it("Should handle repository errors gracefully", async () => {
      const repositoryError = new Error("Database connection failed");
      userRepository.findByEmail.mockRejectedValue(repositoryError);
      const email = "valid@email.com";
      await expect(useCase.execute(email)).rejects.toThrow(repositoryError);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    });
  });
});
