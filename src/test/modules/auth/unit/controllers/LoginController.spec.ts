import { LoginController } from "@modules/auth/controllers/LoginController";
import { LoginUseCase } from "@modules/auth/useCases/LoginUseCase";
import { LoginRequestModel } from "@modules/auth/models/Request/LoginRequest.model";
import { mockLoginResponse } from "../../mocks";
import { HttpRequest } from "@src/shared/types/http";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import enUs from "@modules/auth/lang/en-us";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";
import CustomError from "@src/shared/classes/CustomError";

describe("LoginController", () => {
  let controller: LoginController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  const languagePack = enUs as IAuthTranslation;

  beforeEach(() => {
    loginUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<LoginUseCase>;

    controller = new LoginController({ loginUseCase });
  });

  describe("handle", () => {
    it("Should return success response when login is successful", async () => {
      const loginRequest: LoginRequestModel = {
        email: "test@example.com",
        password: "password123",
      };

      const request: HttpRequest<
        LoginRequestModel,
        undefined,
        undefined,
        IAuthTranslation
      > = {
        body: loginRequest,
        languagePack,
        lang: "en-US",
        headers: {},
      };

      loginUseCase.execute.mockResolvedValue(mockLoginResponse);

      const { data, message, statusCode } = await controller.handle(request);

      expect(loginUseCase.execute).toHaveBeenCalledWith(loginRequest);
      expect(loginUseCase.execute).toHaveBeenCalledTimes(1);

      expect({
        data,
        message: getTranslationMessageFromPath(languagePack, message),
        statusCode,
      }).toEqual({
        statusCode: 200,
        message: getTranslationMessageFromPath<IAuthTranslation>(
          languagePack,
          "auth.login.success",
        ),
        data: mockLoginResponse,
      });
    });

    it("Should propagate error when use case throws", async () => {
      const loginRequest: LoginRequestModel = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const request: HttpRequest<
        LoginRequestModel,
        undefined,
        undefined,
        IAuthTranslation
      > = {
        body: loginRequest,
        languagePack,
        lang: "en-US",
        headers: {},
      };

      loginUseCase.execute.mockRejectedValue(
        new CustomError<IAuthTranslation>("auth.login.invalidCredentials", 401),
      );

      await expect(controller.handle(request)).rejects.toThrow(
        new CustomError<IAuthTranslation>("auth.login.invalidCredentials", 401),
      );

      expect(loginUseCase.execute).toHaveBeenCalledWith(loginRequest);
    });

    it("Should handle request with undefined body", async () => {
      const request: HttpRequest<
        LoginRequestModel,
        undefined,
        undefined,
        IAuthTranslation
      > = {
        languagePack,
        lang: "en-US",
        headers: {},
        body: undefined,
      };

      loginUseCase.execute.mockRejectedValue(
        new CustomError("shared.error.requiredFields", 400),
      );

      await expect(controller.handle(request)).rejects.toThrow(
        new CustomError("shared.error.requiredFields", 400),
      );

      expect(loginUseCase.execute).toHaveBeenCalledWith(undefined);
    });
  });
});
