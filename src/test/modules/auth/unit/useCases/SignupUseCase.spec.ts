import { SignupUseCase } from "@modules/auth/useCases/SignupUseCase";
import { ICredentialRepository } from "@modules/auth/types/ICredentialRepository";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import CustomError from "@src/shared/classes/CustomError";
import { hashPassword } from "@src/shared/utils";

jest.mock("@src/shared/utils", () => ({
  ...jest.requireActual("@src/shared/utils"),
  hashPassword: jest.fn(),
}));

const mockedHashPassword = hashPassword as jest.MockedFunction<
  typeof hashPassword
>;

describe("SignupUseCase", () => {
  let useCase: SignupUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let credentialRepository: jest.Mocked<ICredentialRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    userRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findPaginated: jest.fn(),
      updateUserEmail: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    credentialRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      updateEmail: jest.fn(),
      deleteByUserId: jest.fn(),
    } as jest.Mocked<ICredentialRepository>;

    useCase = new SignupUseCase({ userRepository, credentialRepository });
  });

  describe("Successful execution", () => {
    it("Should create user and credential and return user data", async () => {
      const input = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };
      const hashedPassword = "hashedPassword123";
      const createdUser = {
        id: "userId123",
        username: input.username,
        email: input.email,
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(createdUser);
      mockedHashPassword.mockResolvedValue(hashedPassword);
      credentialRepository.save.mockResolvedValue({
        id: "credentialId",
        userId: "userId123",
        email: input.email,
        secretData: hashedPassword,
      });

      const result = await useCase.execute(input);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        input.username,
      );
      expect(userRepository.save).toHaveBeenCalledWith({
        username: input.username,
        email: input.email,
      });
      expect(mockedHashPassword).toHaveBeenCalledWith(input.password);
      expect(credentialRepository.save).toHaveBeenCalledWith({
        userId: "userId123",
        email: input.email,
        secretData: hashedPassword,
      });
      expect(result).toEqual({
        id: "userId123",
        username: input.username,
        email: input.email,
      });
    });
  });

  describe("Error scenarios", () => {
    it("Should throw error when required fields are missing", async () => {
      await expect(
        useCase.execute({ username: "", email: "", password: "" }),
      ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));
    });

    it("Should throw error when username is missing", async () => {
      await expect(
        useCase.execute({
          username: "",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));
    });

    it("Should throw error when email is missing", async () => {
      await expect(
        useCase.execute({
          username: "testuser",
          email: "",
          password: "password123",
        }),
      ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));
    });

    it("Should throw error when password is missing", async () => {
      await expect(
        useCase.execute({
          username: "testuser",
          email: "test@example.com",
          password: "",
        }),
      ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));
    });

    it("Should throw error when email already exists", async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: "existingId",
        email: "test@example.com",
      });

      await expect(
        useCase.execute({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toEqual(
        new CustomError<IAuthTranslation>(
          "auth.signup.emailAlreadyRegistered",
          409,
        ),
      );
    });

    it("Should throw error when username already exists", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue({
        id: "existingId",
        username: "testuser",
      });

      await expect(
        useCase.execute({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toEqual(
        new CustomError<IAuthTranslation>(
          "auth.signup.usernameAlreadyRegistered",
          409,
        ),
      );
    });

    it("Should throw error when user creation fails", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(null);

      await expect(
        useCase.execute({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toEqual(
        new CustomError<IAuthTranslation>("auth.signup.error", 500),
      );
    });

    it("Should throw error when credential creation fails", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.save.mockResolvedValue({
        id: "userId123",
        username: "testuser",
        email: "test@example.com",
      });
      mockedHashPassword.mockResolvedValue("hashedPassword");
      credentialRepository.save.mockResolvedValue(null);

      await expect(
        useCase.execute({
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toEqual(
        new CustomError<IAuthTranslation>("auth.signup.error", 500),
      );
    });
  });
});
