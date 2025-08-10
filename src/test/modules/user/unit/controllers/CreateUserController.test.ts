// src/test/modules/user/unit/CreateUserUseCase.test.ts
import { CreateUserUseCase } from "@modules/user/useCases/CreateUserUseCase";
import { validCreateUserModel } from "../../mocks/models/CreateUser.mock";
import { CreateUserController } from "@modules/user/controllers/CreateUserController";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import enUs from "@src/modules/user/lang/en-us";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { existingUser } from "../../mocks/entities";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";

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
    } as HttpRequest<typeof validCreateUserModel, IUserTranslation>;

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
});
