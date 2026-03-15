import { IUserRepository } from "@modules/user/types/IUserRepository";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { CreateUserUseCase } from "@modules/user/useCases/CreateUserUseCase";
import {
  invalidCreateUserModel,
  validCreateUserModel,
} from "../../mocks/models";
import CustomError from "@src/shared/classes/CustomError";
import { CreateUserRequestModel } from "@modules/user/models/Request/CreateUserRequest.model";
import { hashPassword } from "@src/shared/utils";
import { ICredentialRepository } from "@modules/auth/types/ICredentialRepository";

jest.mock("@src/shared/utils", () => ({
  ...jest.requireActual("@src/shared/utils"),
  hashPassword: jest.fn(),
}));

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let credentialRepository: jest.Mocked<ICredentialRepository>;
  const mockHashPassword = hashPassword as jest.MockedFunction<
    typeof hashPassword
  >;

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

    useCase = new CreateUserUseCase({ userRepository, credentialRepository });
  });

  it("Should return new user object", async () => {
    const createdUser = {
      id: "mockedId",
      username: validCreateUserModel.username,
      email: validCreateUserModel.email,
    };
    const hashedPassword = "hashedPassword123";

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(createdUser);
    credentialRepository.save.mockResolvedValue({
      id: "credentialId",
      userId: "mockedId",
      email: validCreateUserModel.email,
      secretData: hashedPassword,
    });
    mockHashPassword.mockResolvedValue(hashedPassword);

    const result = await useCase.execute(validCreateUserModel);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      validCreateUserModel.email,
    );
    expect(userRepository.findByUsername).toHaveBeenCalledWith(
      validCreateUserModel.username,
    );
    expect(userRepository.save).toHaveBeenCalledWith({
      username: validCreateUserModel.username,
      email: validCreateUserModel.email,
    });
    expect(mockHashPassword).toHaveBeenCalledWith(
      validCreateUserModel.password,
    );
    expect(credentialRepository.save).toHaveBeenCalledWith({
      userId: "mockedId",
      email: validCreateUserModel.email,
      secretData: hashedPassword,
    });
    expect(result).toEqual(createdUser);
  });

  it("Should return error if some of required fields are missing", async () => {
    await expect(
      useCase.execute(invalidCreateUserModel as CreateUserRequestModel),
    ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));
  });

  it("Should return error if user email already exists", async () => {
    userRepository.findByEmail.mockResolvedValue(validCreateUserModel);
    userRepository.findByUsername.mockResolvedValue(null);
    await expect(useCase.execute(validCreateUserModel)).rejects.toEqual(
      new CustomError<IUserTranslation>(
        "user.createUser.emailAlreadyRegistered",
        409,
      ),
    );
  });

  it("Should return error if username already exists", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(validCreateUserModel);
    await expect(useCase.execute(validCreateUserModel)).rejects.toEqual(
      new CustomError<IUserTranslation>(
        "user.createUser.usernameAlreadyRegistered",
        409,
      ),
    );
  });

  it("Should return error if user could not be created", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(null);
    await expect(useCase.execute(validCreateUserModel)).rejects.toEqual(
      new CustomError<IUserTranslation>("user.createUser.error"),
    );
  });
});
