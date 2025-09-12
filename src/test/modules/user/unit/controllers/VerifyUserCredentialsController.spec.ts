import { VerifyUserCredentialsController } from "@modules/user/controllers/VerifyUserCredentialsController";
import { VerifyUserCredentialsUseCase } from "@modules/user/useCases/VerifyUserCredentialsUseCase";
import { VerifyUserCredentialsRequestModel } from "@modules/user/models/Request/VerifyUserCredentialsRequest.model";
import { VerifyUserCredentialsResponseModel } from "@modules/user/models/Response/VerifyUserCredentialsResponse.model";
import { HttpRequest } from "@src/shared/types/http";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import enUs from "@modules/user/lang/en-us";
import CustomError from "@src/shared/classes/CustomError";

describe("VerifyUserCredentialsController", () => {
  let controller: VerifyUserCredentialsController;
  let verifyUserCredentialsUseCase: jest.Mocked<VerifyUserCredentialsUseCase>;
  const languagePack = enUs as IUserTranslation;

  // Helper function to create request objects with all required properties
  const createRequest = (
    body?: VerifyUserCredentialsRequestModel | null | undefined,
  ) =>
    ({
      body,
      languagePack,
      lang: "en-us",
    }) as HttpRequest<
      VerifyUserCredentialsRequestModel,
      undefined,
      undefined,
      IUserTranslation
    >;

  beforeEach(() => {
    verifyUserCredentialsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<VerifyUserCredentialsUseCase>;

    controller = new VerifyUserCredentialsController({
      verifyUserCredentialsUseCase,
    });
  });

  describe("Successful credential verification", () => {
    it("Should return status 200 with valid credentials result", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: true,
        user: {
          id: "user-id-123",
          username: "testuser",
          email: "test@example.com",
        },
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({
        email: "test@example.com",
        password: "password123",
      });

      const response = await controller.handle(req);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledTimes(1);

      expect(response).toEqual({
        statusCode: 200,
        message: "user.findUser.found",
        data: mockResult,
      });
    });

    it("Should return status 200 with invalid credentials result", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: false,
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({
        email: "test@example.com",
        password: "wrongpassword",
      });

      const response = await controller.handle(req);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "wrongpassword",
      });
      expect(response).toEqual({
        statusCode: 200,
        message: "user.findUser.found",
        data: mockResult,
      });
    });
  });

  describe("Parameter handling", () => {
    it("Should handle missing body object by passing empty strings", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: false,
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest(undefined);

      const response = await controller.handle(req);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "",
        password: "",
      });
      expect(response.statusCode).toBe(200);
    });

    it("Should handle null body by passing empty strings", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: false,
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest(null);

      const response = await controller.handle(req);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "",
        password: "",
      });
      expect(response.statusCode).toBe(200);
    });

    it("Should handle missing email property by passing empty string", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: false,
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({} as VerifyUserCredentialsRequestModel);

      const response = await controller.handle(req);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "",
        password: "",
      });
      expect(response.statusCode).toBe(200);
    });

    it("Should handle missing password property by passing empty string", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: false,
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({
        email: "test@example.com",
      } as VerifyUserCredentialsRequestModel);

      const response = await controller.handle(req);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "",
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("Use case error handling", () => {
    it("Should propagate validation errors from use case", async () => {
      const customError = new CustomError("shared.error.requiredFields", 400);

      verifyUserCredentialsUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({
        email: "",
        password: "password123",
      });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "",
        password: "password123",
      });
    });

    it("Should propagate invalid fields errors", async () => {
      const customError = new CustomError<IUserTranslation>(
        "shared.error.invalidFields",
        400,
      );

      verifyUserCredentialsUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({
        email: "   ",
        password: "password123",
      });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "   ",
        password: "password123",
      });
    });

    it("Should propagate internal server errors", async () => {
      const internalError = new Error("Database connection failed");

      verifyUserCredentialsUseCase.execute.mockRejectedValue(internalError);

      const req = createRequest({
        email: "test@example.com",
        password: "password123",
      });

      await expect(controller.handle(req)).rejects.toThrow(internalError);
      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  describe("Response structure and data", () => {
    it("Should return response with correct structure for valid credentials", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: true,
        user: {
          id: "user-id-123",
          username: "testuser",
          email: "test@example.com",
        },
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({
        email: "test@example.com",
        password: "password123",
      });

      const response = await controller.handle(req);

      expect(response).toMatchObject({
        statusCode: 200,
        message: "user.findUser.found",
        data: {
          isValid: true,
          user: {
            id: "user-id-123",
            username: "testuser",
            email: "test@example.com",
          },
        },
      });

      // Verify data has only the expected fields
      expect(Object.keys(response.data!)).toEqual(["isValid", "user"]);
      expect(Object.keys(response.data!.user!)).toEqual([
        "id",
        "username",
        "email",
      ]);
    });

    it("Should return response with correct structure for invalid credentials", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: false,
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({
        email: "test@example.com",
        password: "wrongpassword",
      });

      const response = await controller.handle(req);

      expect(response).toMatchObject({
        statusCode: 200,
        message: "user.findUser.found",
        data: {
          isValid: false,
        },
      });

      // Verify data has only the expected fields
      expect(Object.keys(response.data!)).toEqual(["isValid"]);
      expect(response.data!.user).toBeUndefined();
    });

    it("Should return exact data from use case", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: true,
        user: {
          id: "exact-id",
          username: "exact-username",
          email: "exact@email.com",
        },
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({
        email: "test@example.com",
        password: "password123",
      });

      const response = await controller.handle(req);

      expect(response.data).toBe(mockResult);
      expect(response.data).toEqual(mockResult);
    });
  });

  describe("Controller behavior", () => {
    it("Should only call use case once per request", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: true,
        user: {
          id: "user-id",
          username: "testuser",
          email: "test@example.com",
        },
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({
        email: "test@example.com",
        password: "password123",
      });

      await controller.handle(req);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("Should handle multiple sequential requests independently", async () => {
      const mockResult1: VerifyUserCredentialsResponseModel = {
        isValid: true,
        user: {
          id: "user-1",
          username: "user1",
          email: "user1@example.com",
        },
      };

      const mockResult2: VerifyUserCredentialsResponseModel = {
        isValid: false,
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValueOnce(mockResult1);
      verifyUserCredentialsUseCase.execute.mockResolvedValueOnce(mockResult2);

      const req1 = createRequest({
        email: "user1@example.com",
        password: "password1",
      });
      const req2 = createRequest({
        email: "user2@example.com",
        password: "wrongpassword",
      });

      const response1 = await controller.handle(req1);
      const response2 = await controller.handle(req2);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledTimes(2);
      expect(verifyUserCredentialsUseCase.execute).toHaveBeenNthCalledWith(1, {
        email: "user1@example.com",
        password: "password1",
      });
      expect(verifyUserCredentialsUseCase.execute).toHaveBeenNthCalledWith(2, {
        email: "user2@example.com",
        password: "wrongpassword",
      });

      expect(response1.data?.isValid).toBe(true);
      expect(response2.data?.isValid).toBe(false);
    });
  });

  describe("Status code validation", () => {
    it("Should return exactly 200 for successful verification", async () => {
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: true,
        user: {
          id: "test-id",
          username: "testuser",
          email: "test@example.com",
        },
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({
        email: "test@example.com",
        password: "password123",
      });

      const response = await controller.handle(req);

      expect(response.statusCode).toBe(200);
      expect(response.statusCode).not.toBe(201);
      expect(response.statusCode).not.toBe(204);
    });
  });

  describe("Data passthrough validation", () => {
    it("Should pass exact parameters to use case", async () => {
      const email = "specific@example.com";
      const password = "specific-password";
      const mockResult: VerifyUserCredentialsResponseModel = {
        isValid: true,
        user: {
          id: "test-id",
          username: "testuser",
          email,
        },
      };

      verifyUserCredentialsUseCase.execute.mockResolvedValue(mockResult);

      const req = createRequest({ email, password });

      await controller.handle(req);

      expect(verifyUserCredentialsUseCase.execute).toHaveBeenCalledWith({
        email,
        password,
      });
    });
  });
});
