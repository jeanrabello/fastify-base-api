import { CreateUserUseCase } from "@modules/user/useCases/CreateUserUseCase";
import { validCreateUserModel } from "../../mocks/models/CreateUser.mock";
import { CreateUserController } from "@modules/user/controllers/CreateUserController";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import enUs from "@src/modules/user/lang/en-us";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { existingUser } from "../../mocks/entities";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";
import CustomError from "@src/shared/classes/CustomError";

describe("CreateUserController", () => {
  let useCase: jest.Mocked<CreateUserUseCase>;
  let controller: CreateUserController;
  const languagePack = enUs as IUserTranslation;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as any;
    controller = new CreateUserController({ createUserUseCase: useCase });
  });

  it("Should return status 201 and the created user", async () => {
    useCase.execute.mockResolvedValue(existingUser);
    const req = {
      body: validCreateUserModel,
      languagePack,
    } as HttpRequest<
      typeof validCreateUserModel,
      undefined,
      undefined,
      IUserTranslation
    >;

    const { data, message, statusCode }: HttpResponse =
      await controller.handle(req);

    expect(useCase.execute).toHaveBeenCalledWith(validCreateUserModel);
    expect({
      data,
      message: getTranslationMessageFromPath(languagePack, message),
      statusCode,
    }).toEqual({
      statusCode: 201,
      message: getTranslationMessageFromPath<IUserTranslation>(
        languagePack,
        "user.createUser.created",
      ),
      data: existingUser,
    });
  });

  it("Should throw error when email already exists", async () => {
    const error = new CustomError<IUserTranslation>(
      "user.createUser.emailAlreadyRegistered",
      409,
    );
    useCase.execute.mockRejectedValue(error);
    const req = {
      body: validCreateUserModel,
      languagePack,
    } as HttpRequest<
      typeof validCreateUserModel,
      undefined,
      undefined,
      IUserTranslation
    >;

    await expect(controller.handle(req)).rejects.toEqual(error);
    expect(useCase.execute).toHaveBeenCalledWith(validCreateUserModel);
  });

  it("Should throw error when username already exists", async () => {
    const error = new CustomError<IUserTranslation>(
      "user.createUser.usernameAlreadyRegistered",
      409,
    );
    useCase.execute.mockRejectedValue(error);
    const req = {
      body: validCreateUserModel,
      languagePack,
    } as HttpRequest<
      typeof validCreateUserModel,
      undefined,
      undefined,
      IUserTranslation
    >;

    await expect(controller.handle(req)).rejects.toEqual(error);
    expect(useCase.execute).toHaveBeenCalledWith(validCreateUserModel);
  });

  it("Should throw error when required fields are missing", async () => {
    const error = new CustomError("shared.error.requiredFields", 400);
    useCase.execute.mockRejectedValue(error);
    const req = {
      body: validCreateUserModel,
      languagePack,
    } as HttpRequest<
      typeof validCreateUserModel,
      undefined,
      undefined,
      IUserTranslation
    >;

    await expect(controller.handle(req)).rejects.toEqual(error);
    expect(useCase.execute).toHaveBeenCalledWith(validCreateUserModel);
  });
});
