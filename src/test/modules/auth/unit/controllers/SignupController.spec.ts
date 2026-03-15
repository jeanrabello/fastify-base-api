import { SignupController } from "@modules/auth/controllers/SignupController";
import { SignupUseCase } from "@modules/auth/useCases/SignupUseCase";
import { SignupRequestModel } from "@modules/auth/models/Request/SignupRequest.model";
import { HttpRequest } from "@src/shared/types/http";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import enUs from "@modules/auth/lang/en-us";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";
import CustomError from "@src/shared/classes/CustomError";

describe("SignupController", () => {
  let controller: SignupController;
  let signupUseCase: jest.Mocked<SignupUseCase>;
  const languagePack = enUs as IAuthTranslation;

  beforeEach(() => {
    signupUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SignupUseCase>;

    controller = new SignupController({ signupUseCase });
  });

  describe("handle", () => {
    it("Should return 201 when signup is successful", async () => {
      const signupRequest: SignupRequestModel = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const mockResult = {
        id: "userId123",
        username: "testuser",
        email: "test@example.com",
      };

      const request: HttpRequest<
        SignupRequestModel,
        undefined,
        undefined,
        IAuthTranslation
      > = {
        body: signupRequest,
        languagePack,
        lang: "en-US",
        headers: {},
      };

      signupUseCase.execute.mockResolvedValue(mockResult);

      const { data, message, statusCode } = await controller.handle(request);

      expect(signupUseCase.execute).toHaveBeenCalledWith(signupRequest);
      expect(signupUseCase.execute).toHaveBeenCalledTimes(1);

      expect({
        data,
        message: getTranslationMessageFromPath(languagePack, message),
        statusCode,
      }).toEqual({
        statusCode: 201,
        message: getTranslationMessageFromPath<IAuthTranslation>(
          languagePack,
          "auth.signup.success",
        ),
        data: mockResult,
      });
    });

    it("Should propagate error when email already exists", async () => {
      const signupRequest: SignupRequestModel = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const request: HttpRequest<
        SignupRequestModel,
        undefined,
        undefined,
        IAuthTranslation
      > = {
        body: signupRequest,
        languagePack,
        lang: "en-US",
        headers: {},
      };

      signupUseCase.execute.mockRejectedValue(
        new CustomError<IAuthTranslation>(
          "auth.signup.emailAlreadyRegistered",
          409,
        ),
      );

      await expect(controller.handle(request)).rejects.toThrow(
        new CustomError<IAuthTranslation>(
          "auth.signup.emailAlreadyRegistered",
          409,
        ),
      );

      expect(signupUseCase.execute).toHaveBeenCalledWith(signupRequest);
    });

    it("Should propagate error when required fields are missing", async () => {
      const request: HttpRequest<
        SignupRequestModel,
        undefined,
        undefined,
        IAuthTranslation
      > = {
        body: undefined,
        languagePack,
        lang: "en-US",
        headers: {},
      };

      signupUseCase.execute.mockRejectedValue(
        new CustomError("shared.error.requiredFields", 400),
      );

      await expect(controller.handle(request)).rejects.toThrow(
        new CustomError("shared.error.requiredFields", 400),
      );
    });
  });
});
