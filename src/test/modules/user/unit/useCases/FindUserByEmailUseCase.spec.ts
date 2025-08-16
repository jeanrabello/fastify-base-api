import { FindUserByEmailUseCase } from "@modules/user/useCases/FindUserByEmailUseCase";
import { User } from "@src/shared/entities/user.entity";
import CustomError from "@src/shared/classes/CustomError";

describe("FindUserByEmailUseCase", () => {
  let useCase: FindUserByEmailUseCase;
  let userRepository: jest.Mocked<{
    findByEmailWithPassword: jest.Mock;
  }>;

  const mockUser: User = {
    id: "1",
    username: "testuser",
    email: "test@example.com",
    password: "hashedpassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    userRepository = {
      findByEmailWithPassword: jest.fn(),
    };
    useCase = new FindUserByEmailUseCase({ userRepository } as any);
  });

  describe("Successful execution", () => {
    it("should return user when found", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      const result = await useCase.execute(mockUser.email);
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        mockUser.email,
      );
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);
      const email = "notfound@example.com";
      const result = await useCase.execute(email);
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        "notfound@example.com",
      );
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("Input validation", () => {
    it("should throw error when email is null", async () => {
      await expect(useCase.execute(null as any)).rejects.toEqual(
        new CustomError("shared.error.invalidFields", 400),
      );
      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it("should throw error when email is undefined", async () => {
      await expect(useCase.execute(undefined as any)).rejects.toEqual(
        new CustomError("shared.error.invalidFields", 400),
      );
      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it("should throw error when email is empty string", async () => {
      await expect(useCase.execute("")).rejects.toEqual(
        new CustomError("shared.error.invalidFields", 400),
      );
      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });

    it("should throw error when email is whitespace-only", async () => {
      await expect(useCase.execute("   ")).rejects.toEqual(
        new CustomError("shared.error.invalidFields", 400),
      );
      expect(userRepository.findByEmailWithPassword).not.toHaveBeenCalled();
    });
  });

  describe("Repository interaction", () => {
    it("should call repository with correct parameters", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);
      const email = "valid@email.com";
      await useCase.execute(email);
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        email,
      );
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledTimes(1);
    });

    it("should handle repository errors gracefully", async () => {
      const repositoryError = new Error("Database connection failed");
      userRepository.findByEmailWithPassword.mockRejectedValue(repositoryError);
      const email = "valid@email.com";
      await expect(useCase.execute(email)).rejects.toThrow(repositoryError);
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        email,
      );
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledTimes(1);
    });
  });
});
