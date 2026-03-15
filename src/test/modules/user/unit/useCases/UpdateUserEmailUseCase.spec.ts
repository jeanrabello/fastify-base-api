import { IUserRepository } from "@modules/user/types/IUserRepository";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { UpdateUserEmailUseCase } from "@modules/user/useCases/UpdateUserEmailUseCase";
import { existingUser } from "../../mocks/entities";
import CustomError from "@src/shared/classes/CustomError";
import { User } from "@src/shared/entities/user.entity";
import { UpdateUserEmailResponseModel } from "@modules/user/models/Response/UpdateUserEmailResponse.model";

describe("UpdateUserEmailUseCase", () => {
  let useCase: UpdateUserEmailUseCase;
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
    useCase = new UpdateUserEmailUseCase({ userRepository });
  });

  describe("Successful email update", () => {
    it("Should return updated user object when email is successfully updated", async () => {
      const userId = existingUser.id!;
      const newEmail = "newemail@example.com";
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };
      const updatedUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: newEmail,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(null); // Email not taken
      userRepository.updateUserEmail.mockResolvedValue(updatedUser);

      const result: UpdateUserEmailResponseModel = await useCase.execute({
        userId,
        email: newEmail,
      });

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(newEmail);
      expect(userRepository.updateUserEmail).toHaveBeenCalledWith(
        userId,
        newEmail,
      );

      expect(result).toEqual({
        id: existingUser.id,
        username: existingUser.username,
        email: newEmail,
      });
    });

    it("Should allow user to update to their own current email", async () => {
      const userId = existingUser.id!;
      const currentEmail = existingUser.email;
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };
      const userFoundByEmail: Partial<User> = {
        id: existingUser.id, // Same user ID
        username: existingUser.username,
        email: existingUser.email,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(userFoundByEmail);
      userRepository.updateUserEmail.mockResolvedValue(mockUser);

      const result = await useCase.execute({
        userId,
        email: currentEmail,
      });

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(currentEmail);
      expect(userRepository.updateUserEmail).toHaveBeenCalledWith(
        userId,
        currentEmail,
      );
      expect(result).toEqual({
        id: existingUser.id,
        username: existingUser.username,
        email: currentEmail,
      });
    });
  });

  describe("Input validation", () => {
    it("Should throw error when userId is missing", async () => {
      await expect(
        useCase.execute({ email: "test@example.com" }),
      ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));

      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.updateUserEmail).not.toHaveBeenCalled();
    });

    it("Should throw error when email is missing", async () => {
      await expect(
        useCase.execute({ userId: existingUser.id }),
      ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));

      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.updateUserEmail).not.toHaveBeenCalled();
    });

    it("Should throw error when both userId and email are missing", async () => {
      await expect(useCase.execute({})).rejects.toEqual(
        new CustomError("shared.error.requiredFields", 400),
      );

      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userRepository.updateUserEmail).not.toHaveBeenCalled();
    });

    it("Should throw error when userId is empty string", async () => {
      await expect(
        useCase.execute({ userId: "", email: "test@example.com" }),
      ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));

      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it("Should throw error when email is empty string", async () => {
      await expect(
        useCase.execute({ userId: existingUser.id, email: "" }),
      ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));

      expect(userRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe("User not found", () => {
    it("Should throw error when user with given ID does not exist", async () => {
      const userId = "nonexistent123";
      const newEmail = "test@example.com";

      userRepository.findById.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null); // This will be called

      await expect(
        useCase.execute({ userId, email: newEmail }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("user.updateUserEmail.notFound", 404),
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(newEmail);
      expect(userRepository.updateUserEmail).not.toHaveBeenCalled();
    });
  });

  describe("Email already registered", () => {
    it("Should throw error when email is already registered by another user", async () => {
      const userId = existingUser.id!;
      const newEmail = "taken@example.com";
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };
      const userWithTakenEmail: Partial<User> = {
        id: "different-user-id",
        username: "differentuser",
        email: newEmail,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(userWithTakenEmail);

      await expect(
        useCase.execute({ userId, email: newEmail }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>(
          "user.updateUserEmail.emailAlreadyRegistered",
          409,
        ),
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(newEmail);
      expect(userRepository.updateUserEmail).not.toHaveBeenCalled();
    });
  });

  describe("Update operation failure", () => {
    it("Should throw error when repository update fails", async () => {
      const userId = existingUser.id!;
      const newEmail = "newemail@example.com";
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.updateUserEmail.mockResolvedValue(null); // Update failed

      await expect(
        useCase.execute({ userId, email: newEmail }),
      ).rejects.toEqual(
        new CustomError<IUserTranslation>("user.updateUserEmail.error", 500),
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(newEmail);
      expect(userRepository.updateUserEmail).toHaveBeenCalledWith(
        userId,
        newEmail,
      );
    });
  });

  describe("Repository interaction sequence", () => {
    it("Should call repository methods in correct order", async () => {
      const userId = existingUser.id!;
      const newEmail = "newemail@example.com";
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };
      const updatedUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: newEmail,
      };

      let findByIdCalled = false;
      let findByEmailCalled = false;
      let updateCalled = false;

      userRepository.findById.mockImplementation(async () => {
        findByIdCalled = true;
        expect(findByEmailCalled).toBe(false);
        expect(updateCalled).toBe(false);
        return mockUser;
      });

      userRepository.findByEmail.mockImplementation(async () => {
        findByEmailCalled = true;
        expect(findByIdCalled).toBe(true);
        expect(updateCalled).toBe(false);
        return null;
      });

      userRepository.updateUserEmail.mockImplementation(async () => {
        updateCalled = true;
        expect(findByIdCalled).toBe(true);
        expect(findByEmailCalled).toBe(true);
        return updatedUser;
      });

      await useCase.execute({ userId, email: newEmail });

      expect(findByIdCalled).toBe(true);
      expect(findByEmailCalled).toBe(true);
      expect(updateCalled).toBe(true);
    });
  });

  describe("Repository error handling", () => {
    it("Should propagate errors from findById", async () => {
      const userId = existingUser.id!;
      const newEmail = "test@example.com";
      const repositoryError = new Error("Database connection failed");

      userRepository.findById.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({ userId, email: newEmail }),
      ).rejects.toThrow(repositoryError);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("Should propagate errors from findByEmail", async () => {
      const userId = existingUser.id!;
      const newEmail = "test@example.com";
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };
      const repositoryError = new Error("Database connection failed");

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({ userId, email: newEmail }),
      ).rejects.toThrow(repositoryError);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(newEmail);
      expect(userRepository.updateUserEmail).not.toHaveBeenCalled();
    });

    it("Should propagate errors from updateUserEmail", async () => {
      const userId = existingUser.id!;
      const newEmail = "test@example.com";
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };
      const repositoryError = new Error("Database connection failed");

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.updateUserEmail.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({ userId, email: newEmail }),
      ).rejects.toThrow(repositoryError);

      expect(userRepository.updateUserEmail).toHaveBeenCalledWith(
        userId,
        newEmail,
      );
    });
  });

  describe("Response data filtering", () => {
    it("Should only return id, username, and email in response", async () => {
      const userId = existingUser.id!;
      const newEmail = "newemail@example.com";
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };
      const updatedUserWithExtraFields: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: newEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.updateUserEmail.mockResolvedValue(
        updatedUserWithExtraFields,
      );

      const result = await useCase.execute({ userId, email: newEmail });

      expect(result).toEqual({
        id: existingUser.id,
        username: existingUser.username,
        email: newEmail,
      });

      // Verify sensitive fields are not included
      expect(result).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("createdAt");
      expect(result).not.toHaveProperty("updatedAt");
    });
  });

  it("Should throw access forbidden when currentUserId is different from userId", async () => {
    const userId = existingUser.id!;
    const newEmail = "newemail@example.com";
    const mockUser: Partial<User> = {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
    };

    userRepository.findById.mockResolvedValue(mockUser);
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, email: newEmail, currentUserId: "other-id" }),
    ).rejects.toEqual(new CustomError("shared.error.accessForbidden", 403));
  });
});
