import enUs from "@modules/user/lang/en-us";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { CreateUserUseCase } from "@modules/user/useCases/CreateUserUseCase";
import {
  invalidCreateUserModel,
  validCreateUserModel,
} from "../../mocks/models";
import CustomError from "@src/shared/classes/CustomError";
import { CreateUserModel } from "@modules/user/models/Request/CreateUserRequest.model";

describe("CreateUserUseCase", () => {
  const languagePack = enUs as IUserTranslation;
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new CreateUserUseCase({ userRepository });
  });

  it("Should return new user object", async () => {
    const { password, ...createdUser } = {
      id: "mockedId",
      ...validCreateUserModel,
    };
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(createdUser);

    const { id, username, email } = await useCase.execute(validCreateUserModel);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      validCreateUserModel.email,
    );
    expect(userRepository.save).toHaveBeenCalledWith(validCreateUserModel);
    expect({ id, username, email }).toEqual(createdUser);
  });

  it("Should return error if some of required fields are missing", async () => {
    await expect(
      useCase.execute(invalidCreateUserModel as CreateUserModel),
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

  it("Should return error if user not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute(validCreateUserModel)).rejects.toEqual(
      new CustomError<IUserTranslation>("user.createUser.error"),
    );
  });
});
