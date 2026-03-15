import { FindUserController } from "@modules/user/controllers/FindUserController";
import { FindUserByIdUseCase } from "@modules/user/useCases/FindUserByIdUseCase";
import enUs from "@modules/user/lang/en-us";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { existingUser } from "../../mocks/entities";
import { UserIdParamsModel } from "@modules/user/models/Request/UserIdParams.model";
import { FindUserByIdResponseModel } from "@modules/user/models/Response/FindUserByIdResponse.model";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";
import CustomError from "@src/shared/classes/CustomError";
import { User } from "@src/shared/entities/user.entity";

describe("FindUserController", () => {
  let controller: FindUserController;
  let findUserByIdUseCase: jest.Mocked<FindUserByIdUseCase>;
  const languagePack = enUs as IUserTranslation;

  // Helper function to create request objects with all required properties
  const createRequest = (params?: UserIdParamsModel | null | undefined) =>
    ({
      params,
      languagePack,
      lang: "en-us",
    }) as HttpRequest<null, UserIdParamsModel, undefined, IUserTranslation>;

  beforeEach(() => {
    findUserByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<FindUserByIdUseCase>;

    controller = new FindUserController({
      findUserByIdUseCase,
    });
  });

  describe("Successful user retrieval", () => {
    it("Should return status 200 with user data when user is found", async () => {
      const userId = existingUser.id!;
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const req = createRequest({ id: userId });

      const response: HttpResponse<
        IUserTranslation,
        FindUserByIdResponseModel | null
      > = await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledTimes(1);

      expect(response).toEqual({
        statusCode: 200,
        message: "user.findUser.found",
        data: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
        },
      });
    });

    it("Should return correct response structure matching FindUserByIdResponseModel", async () => {
      const userId = existingUser.id!;
      const mockUser: Partial<User> = {
        id: "user123",
        username: "testuser",
        email: "test@example.com",
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const req = createRequest({ id: userId });
      const response = await controller.handle(req);

      expect(response.data).toMatchObject({
        id: "user123",
        username: "testuser",
        email: "test@example.com",
      });

      // Verify the response data has only the expected fields
      expect(Object.keys(response.data!)).toEqual(["id", "username", "email"]);
    });
  });

  describe("User not found", () => {
    it("Should return status 404 when user does not exist", async () => {
      const userId = "nonexistent123";

      findUserByIdUseCase.execute.mockResolvedValue(null);

      const req = createRequest({ id: userId });

      const response: HttpResponse<
        IUserTranslation,
        FindUserByIdResponseModel | null
      > = await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledTimes(1);

      expect(response).toEqual({
        statusCode: 404,
        message: "user.findUser.notFound",
      });

      expect(response.data).toBeUndefined();
    });
  });

  describe("Parameter validation", () => {
    it("Should throw error when params object is missing", async () => {
      const error = new CustomError("shared.error.requiredFields", 400);
      findUserByIdUseCase.execute.mockRejectedValue(error);

      const req = createRequest(undefined);

      await expect(controller.handle(req)).rejects.toThrow(error);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("");
    });

    it("Should throw error when id property is missing", async () => {
      const error = new CustomError("shared.error.requiredFields", 400);
      findUserByIdUseCase.execute.mockRejectedValue(error);

      const req = createRequest({} as UserIdParamsModel);

      await expect(controller.handle(req)).rejects.toThrow(error);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("");
    });

    it("Should throw error when params is null", async () => {
      const error = new CustomError("shared.error.requiredFields", 400);
      findUserByIdUseCase.execute.mockRejectedValue(error);

      const req = createRequest(null);

      await expect(controller.handle(req)).rejects.toThrow(error);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("");
    });

    it("Should handle valid id parameter correctly", async () => {
      const userId = "valid-user-id-123";
      const mockUser: Partial<User> = {
        id: userId,
        username: "validuser",
        email: "valid@example.com",
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const req = createRequest({ id: userId });

      const response = await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(response.statusCode).toBe(200);
      expect(response.data?.id).toBe(userId);
    });
  });

  describe("Use case error handling", () => {
    it("Should propagate errors from FindUserByIdUseCase", async () => {
      const userId = existingUser.id!;
      const customError = new CustomError("shared.error.requiredFields", 400);

      findUserByIdUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({ id: userId });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
    });

    it("Should propagate validation errors from use case", async () => {
      const userId = "";
      const customError = new CustomError("shared.error.requiredFields", 400);

      findUserByIdUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({ id: userId });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
    });

    it("Should propagate internal server errors", async () => {
      const userId = existingUser.id!;
      const internalError = new Error("Database connection failed");

      findUserByIdUseCase.execute.mockRejectedValue(internalError);

      const req = createRequest({ id: userId });

      await expect(controller.handle(req)).rejects.toThrow(internalError);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });

  describe("Response message consistency", () => {
    it("Should return correct message for successful user retrieval", async () => {
      const userId = existingUser.id!;
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const req = createRequest({ id: userId });

      const response = await controller.handle(req);
      const translatedMessage = getTranslationMessageFromPath(
        languagePack,
        response.message!,
      );

      expect(translatedMessage).toBe("User found");
      expect(response.message).toBe("user.findUser.found");
    });

    it("Should return correct message for user not found", async () => {
      const userId = "nonexistent123";

      findUserByIdUseCase.execute.mockResolvedValue(null);

      const req = createRequest({ id: userId });

      const response = await controller.handle(req);
      const translatedMessage = getTranslationMessageFromPath(
        languagePack,
        response.message!,
      );

      expect(translatedMessage).toBe("User not found");
      expect(response.message).toBe("user.findUser.notFound");
    });
  });

  describe("Data transformation", () => {
    it("Should correctly map user data to response model", async () => {
      const userId = "test-user-id";
      const mockUser: Partial<User> = {
        id: "test-user-id",
        username: "testusername",
        email: "test@email.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const req = createRequest({ id: userId });
      const response = await controller.handle(req);

      // Verify only expected fields are included
      expect(response.data).toEqual({
        id: "test-user-id",
        username: "testusername",
        email: "test@email.com",
      });

      // Verify sensitive fields are not included
      expect(response.data).not.toHaveProperty("password");
      expect(response.data).not.toHaveProperty("createdAt");
      expect(response.data).not.toHaveProperty("updatedAt");
    });

    it("Should handle user with undefined optional fields", async () => {
      const userId = "minimal-user";
      const mockUser: Partial<User> = {
        id: "minimal-user",
        username: "minimaluser",
        email: "minimal@example.com",
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const req = createRequest({ id: userId });
      const response = await controller.handle(req);

      expect(response.data).toEqual({
        id: "minimal-user",
        username: "minimaluser",
        email: "minimal@example.com",
      });
    });
  });

  describe("Controller behavior", () => {
    it("Should only call use case once per request", async () => {
      const userId = existingUser.id!;
      const mockUser: Partial<User> = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const req = createRequest({ id: userId });
      await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledTimes(1);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
    });

    it("Should handle multiple requests independently", async () => {
      const userId1 = "user1";
      const userId2 = "user2";
      const mockUser1: Partial<User> = {
        id: "user1",
        username: "username1",
        email: "user1@example.com",
      };
      const mockUser2: Partial<User> = {
        id: "user2",
        username: "username2",
        email: "user2@example.com",
      };

      // First request
      findUserByIdUseCase.execute.mockResolvedValueOnce(mockUser1);
      const req1 = createRequest({ id: userId1 });
      const response1 = await controller.handle(req1);

      // Second request
      findUserByIdUseCase.execute.mockResolvedValueOnce(mockUser2);
      const req2 = createRequest({ id: userId2 });
      const response2 = await controller.handle(req2);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledTimes(2);
      expect(findUserByIdUseCase.execute).toHaveBeenNthCalledWith(1, userId1);
      expect(findUserByIdUseCase.execute).toHaveBeenNthCalledWith(2, userId2);

      expect(response1.data?.id).toBe("user1");
      expect(response2.data?.id).toBe("user2");
    });
  });

  describe("Status code validation", () => {
    it("Should return exactly 200 for successful retrieval", async () => {
      const mockUser: Partial<User> = {
        id: "test-id",
        username: "testuser",
        email: "test@example.com",
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const req = createRequest({ id: "test-id" });
      const response = await controller.handle(req);

      expect(response.statusCode).toBe(200);
      expect(response.statusCode).not.toBe(201);
      expect(response.statusCode).not.toBe(204);
    });

    it("Should return exactly 404 for user not found", async () => {
      findUserByIdUseCase.execute.mockResolvedValue(null);

      const req = createRequest({ id: "nonexistent" });
      const response = await controller.handle(req);

      expect(response.statusCode).toBe(404);
      expect(response.statusCode).not.toBe(400);
      expect(response.statusCode).not.toBe(500);
    });
  });
});
