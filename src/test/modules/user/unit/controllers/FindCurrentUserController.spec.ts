import { FindCurrentUserController } from "@modules/user/controllers/FindCurrentUserController";
import { FindUserByIdUseCase } from "@modules/user/useCases/FindUserByIdUseCase";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import enUs from "@src/modules/user/lang/en-us";
import { HttpRequest } from "@src/shared/types/http";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";
import CustomError from "@src/shared/classes/CustomError";

describe("FindCurrentUserController", () => {
  let controller: FindCurrentUserController;
  let findUserByIdUseCase: jest.Mocked<FindUserByIdUseCase>;
  const languagePack = enUs as IUserTranslation;

  const createRequest = (
    userId?: string,
  ): HttpRequest<undefined, undefined, undefined, IUserTranslation> => ({
    languagePack,
    lang: "en-US",
    headers: { authorization: "Bearer valid.token" },
    user: userId ? { id: userId, email: "test@example.com" } : undefined,
  });

  beforeEach(() => {
    findUserByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindUserByIdUseCase>;

    controller = new FindCurrentUserController({ findUserByIdUseCase });
  });

  it("Should return 200 with user data when user is found", async () => {
    const mockUser = {
      id: "user123",
      username: "testuser",
      email: "test@example.com",
    };

    findUserByIdUseCase.execute.mockResolvedValue(mockUser);

    const request = createRequest("user123");
    const { data, message, statusCode } = await controller.handle(request);

    expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("user123");
    expect(findUserByIdUseCase.execute).toHaveBeenCalledTimes(1);
    expect({
      data,
      message: getTranslationMessageFromPath(languagePack, message),
      statusCode,
    }).toEqual({
      statusCode: 200,
      message: getTranslationMessageFromPath<IUserTranslation>(
        languagePack,
        "user.findUser.found",
      ),
      data: mockUser,
    });
  });

  it("Should return 404 when user is not found", async () => {
    findUserByIdUseCase.execute.mockResolvedValue(null);

    const request = createRequest("nonexistent-id");
    const { message, statusCode } = await controller.handle(request);

    expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("nonexistent-id");
    expect({
      message: getTranslationMessageFromPath(languagePack, message),
      statusCode,
    }).toEqual({
      statusCode: 404,
      message: getTranslationMessageFromPath<IUserTranslation>(
        languagePack,
        "user.findUser.notFound",
      ),
    });
  });

  it("Should pass empty string when user id is not in token", async () => {
    const request = createRequest();

    findUserByIdUseCase.execute.mockRejectedValue(
      new CustomError("shared.error.requiredFields", 400),
    );

    await expect(controller.handle(request)).rejects.toThrow(
      new CustomError("shared.error.requiredFields", 400),
    );

    expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("");
  });
});
