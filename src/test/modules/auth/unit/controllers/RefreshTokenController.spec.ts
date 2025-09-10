import { RefreshTokenController } from "@modules/auth/controllers/RefreshTokenController";
import { RefreshTokenUseCase } from "@modules/auth/useCases/RefreshTokenUseCase";
import { HttpRequest } from "@src/shared/types/http";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import CustomError from "@src/shared/classes/CustomError";
import enUs from "@modules/auth/lang/en-us";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";

describe("RefreshTokenController", () => {
  let controller: RefreshTokenController;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  const languagePack = enUs as IAuthTranslation;

  beforeEach(() => {
    refreshTokenUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenUseCase>;

    controller = new RefreshTokenController({ refreshTokenUseCase });
  });

  it("Should return success response when token refresh is successful", async () => {
    const request: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization: "Bearer valid.refresh.token",
      },
      languagePack,
      lang: "en-US",
    };

    const expectedResponse = {
      accessToken: "new.access.token",
      refreshToken: "new.refresh.token",
      expiresIn: 900,
    };

    refreshTokenUseCase.execute.mockResolvedValue(expectedResponse);

    const { data, message, statusCode } = await controller.handle(request);

    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
      "Bearer valid.refresh.token",
    );

    expect(refreshTokenUseCase.execute).toHaveBeenCalledTimes(1);

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
        "auth.refreshToken.success",
      ),
      data: expectedResponse,
    });
  });

  it("Should throw error when Authorization header is missing", async () => {
    const request: HttpRequest<
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
    refreshTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(request)).rejects.toThrow(error);
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith("");
  });

  it("Should propagate CustomError when use case throws", async () => {
    const request: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization: "Bearer invalid.refresh.token",
      },
      languagePack,
      lang: "en-US",
    };

    const error = new CustomError<IAuthTranslation>(
      "auth.refreshToken.invalidToken",
      401,
    );
    refreshTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(request)).rejects.toThrow(error);
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
      "Bearer invalid.refresh.token",
    );
  });

  it("Should propagate any error thrown by use case", async () => {
    const request: HttpRequest<
      undefined,
      undefined,
      undefined,
      IAuthTranslation
    > = {
      headers: {
        authorization: "Bearer some.refresh.token",
      },
      languagePack,
      lang: "en-US",
    };

    const error = new CustomError("shared.error.internalServerError", 500);
    refreshTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(request)).rejects.toThrow(error);
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
      "Bearer some.refresh.token",
    );
  });

  it("Should throw error when authorization header is undefined", async () => {
    const request: HttpRequest<
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
    refreshTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(request)).rejects.toThrow(error);
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith("");
  });

  it("Should throw error when authorization header is empty", async () => {
    const request: HttpRequest<
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
    refreshTokenUseCase.execute.mockRejectedValue(error);

    await expect(controller.handle(request)).rejects.toThrow(error);
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith("");
  });
});
