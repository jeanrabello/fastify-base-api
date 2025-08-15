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

jest.mock("@src/shared/utils", () => ({
  ...jest.requireActual("@src/shared/utils"),
  hashPassword: jest.fn(),
}));

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  const mockHashPassword = hashPassword as jest.MockedFunction<
    typeof hashPassword
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    userRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findPaginated: jest.fn(),
      updateUserEmail: jest.fn(),
    };
    useCase = new CreateUserUseCase({ userRepository });
  });

  it("Should return new user object", async () => {
    const { password, ...createdUser } = {
      id: "mockedId",
      ...validCreateUserModel,
    };
    const hashedPassword = "hashedPassword123";

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(createdUser);
    mockHashPassword.mockResolvedValue(hashedPassword);

    const { id, username, email } = await useCase.execute(validCreateUserModel);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      validCreateUserModel.email,
    );
    expect(mockHashPassword).toHaveBeenCalledWith(
      validCreateUserModel.password,
    );
    expect(userRepository.save).toHaveBeenCalledWith({
      ...validCreateUserModel,
      password: hashedPassword,
    });
    expect({ id, username, email }).toEqual(createdUser);
  });

  it("Should return error if some of required fields are missing", async () => {
    await expect(
      useCase.execute(invalidCreateUserModel as CreateUserRequestModel),
    ).rejects.toEqual(new CustomError("shared.error.requiredFields", 400));
  });

  it("Should return error if user already exists", async () => {
    userRepository.findByEmail.mockResolvedValue(validCreateUserModel);
    await expect(useCase.execute(validCreateUserModel)).rejects.toEqual(
      new CustomError<IUserTranslation>(
        "user.createUser.emailAlreadyRegistered",
        409,
      ),
    );
  });

  it("Should return error if user could not be created", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(null);
    await expect(useCase.execute(validCreateUserModel)).rejects.toEqual(
      new CustomError<IUserTranslation>("user.createUser.error"),
    );
  });
});
