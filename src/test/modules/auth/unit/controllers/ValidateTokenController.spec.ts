import { ValidateTokenController } from "@modules/auth/controllers/ValidateTokenController";
import { ValidateTokenUseCase } from "@modules/auth/useCases/ValidateTokenUseCase";
import { mockTokenPayload } from "../../mocks";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import { HttpRequest } from "@src/shared/types/http";
import CustomError from "@src/shared/classes/CustomError";
import enUs from "@modules/auth/lang/en-us";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";

describe("ValidateTokenController", () => {
  let controller: ValidateTokenController;
  let validateTokenUseCase: jest.Mocked<ValidateTokenUseCase>;
  const languagePack = enUs as IAuthTranslation;

  beforeEach(() => {
    validateTokenUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new ValidateTokenController({ validateTokenUseCase });
  });

  it("Should return success response when token is valid", async () => {
    const mockRequest: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization: "Bearer valid.jwt.token",
      },
      languagePack,
      lang: "en-US",
    };

    const expectedResponse = {
      valid: true,
      user: {
        id: mockTokenPayload.id,
        email: mockTokenPayload.email,
        name: mockTokenPayload.name,
      },
    };

    validateTokenUseCase.execute.mockResolvedValue(expectedResponse);

    const { data, message, statusCode } = await controller.handle(mockRequest);

    expect(validateTokenUseCase.execute).toHaveBeenCalledWith(
      "Bearer valid.jwt.token",
    );
    expect(validateTokenUseCase.execute).toHaveBeenCalledTimes(1);

    expect({
      statusCode,
      message: getTranslationMessageFromPath<IAuthTranslation>(
        languagePack,
        message,
      ),
      data,
    }).toEqual({
      statusCode: 200,
      message: getTranslationMessageFromPath<IAuthTranslation>(
        languagePack,
        "auth.validateToken.success",
      ),
      data: expectedResponse,
    });
  });

  it("Should throw error when Authorization header is missing", async () => {
    const mockRequest: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {},
      languagePack,
      lang: "en-US",
    };

    const error = new CustomError("shared.error.requiredFields", 400);
    validateTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(mockRequest)).rejects.toThrow(error);
    expect(validateTokenUseCase.execute).toHaveBeenCalledWith("");
  });

  it("Should pass token value regardless of format", async () => {
    const mockRequest: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization: "Basic invalid.token",
      },
      languagePack,
      lang: "en-US",
    };

    const expectedResponse = {
      valid: true,
      user: {
        id: mockTokenPayload.id,
        email: mockTokenPayload.email,
        name: mockTokenPayload.name,
      },
    };

    validateTokenUseCase.execute.mockResolvedValue(expectedResponse);

    const { data, message, statusCode } = await controller.handle(mockRequest);

    expect(validateTokenUseCase.execute).toHaveBeenCalledWith(
      "Basic invalid.token",
    );
    expect({
      statusCode,
      message: getTranslationMessageFromPath<IAuthTranslation>(
        languagePack,
        message,
      ),
      data,
    }).toEqual({
      statusCode: 200,
      message: getTranslationMessageFromPath<IAuthTranslation>(
        languagePack,
        "auth.validateToken.success",
      ),
      data: expectedResponse,
    });
  });

  it("Should propagate CustomError when use case throws", async () => {
    const authorization = "Bearer invalid.jwt.token";
    const mockRequest: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization,
      },
      languagePack,
      lang: "en-US",
    };

    const error = new CustomError<IAuthTranslation>(
      "auth.validateToken.invalidToken",
      401,
    );
    validateTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(mockRequest)).rejects.toThrow(error);
    expect(validateTokenUseCase.execute).toHaveBeenCalledWith(authorization);
  });

  it("Should propagate any error thrown by use case", async () => {
    const authorization = "Bearer invalid.jwt.token";
    const mockRequest: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization,
      },
      languagePack,
      lang: "en-US",
    };

    const error = new CustomError("shared.error.internalServerError", 500);
    validateTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(mockRequest)).rejects.toThrow(error);
    expect(validateTokenUseCase.execute).toHaveBeenCalledWith(authorization);
  });

  it("Should throw error when authorization header is undefined", async () => {
    const mockRequest: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization: undefined,
      },
      languagePack,
      lang: "en-US",
    };

    const error = new CustomError("shared.error.requiredFields", 400);
    validateTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(mockRequest)).rejects.toThrow(error);
    expect(validateTokenUseCase.execute).toHaveBeenCalledWith("");
  });

  it("Should throw error when authorization header is empty", async () => {
    const mockRequest: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization: "",
      },
      languagePack,
      lang: "en-US",
    };

    const error = new CustomError("shared.error.requiredFields", 400);
    validateTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(mockRequest)).rejects.toThrow(error);
    expect(validateTokenUseCase.execute).toHaveBeenCalledWith("");
  });
});
