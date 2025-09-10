import { UpdateUserEmailController } from "@modules/user/controllers/UpdateUserEmailController";
import { UpdateUserEmailUseCase } from "@modules/user/useCases/UpdateUserEmailUseCase";
import enUs from "@modules/user/lang/en-us";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { existingUser } from "../../mocks/entities";
import { UserIdParamsModel } from "@modules/user/models/Request/UserIdParams.model";
import { UpdateUserEmailRequestModel } from "@modules/user/models/Request/UpdateUserEmailRequest.model";
import { UpdateUserEmailResponseModel } from "@modules/user/models/Response/UpdateUserEmailResponse.model";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";
import CustomError from "@src/shared/classes/CustomError";

describe("UpdateUserEmailController", () => {
  let controller: UpdateUserEmailController;
  let updateUserEmailUseCase: jest.Mocked<UpdateUserEmailUseCase>;
  const languagePack = enUs as IUserTranslation;

  // Helper function to create request objects with all required properties
  const createRequest = (
    body?: UpdateUserEmailRequestModel | null | undefined,
    params?: UserIdParamsModel | null | undefined,
  ) =>
    ({
      body,
      params,
      languagePack,
      lang: "en-us",
    }) as HttpRequest<
      UpdateUserEmailRequestModel,
      UserIdParamsModel,
      undefined,
      IUserTranslation
    >;

  beforeEach(() => {
    updateUserEmailUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateUserEmailUseCase>;

    controller = new UpdateUserEmailController({
      updateUserEmailUseCase,
    });
  });

  describe("Successful email update", () => {
    it("Should return status 200 with updated user data when email is successfully updated", async () => {
      const userId = existingUser.id!;
      const newEmail = "newemail@example.com";
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: existingUser.id!,
        username: existingUser.username,
        email: newEmail,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email: newEmail }, { id: userId });

      const response: HttpResponse<
        IUserTranslation,
        UpdateUserEmailResponseModel
      > = await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: newEmail,
      });
      expect(updateUserEmailUseCase.execute).toHaveBeenCalledTimes(1);

      expect(response).toEqual({
        statusCode: 200,
        message: "user.updateUserEmail.updated",
        data: mockUpdatedUser,
      });
    });

    it("Should handle successful update with same email", async () => {
      const userId = existingUser.id!;
      const currentEmail = existingUser.email;
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: existingUser.id!,
        username: existingUser.username,
        email: currentEmail,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email: currentEmail }, { id: userId });

      const response = await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: currentEmail,
      });
      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual(mockUpdatedUser);
    });
  });

  describe("Parameter handling", () => {
    it("Should handle missing params object by using empty string for userId", async () => {
      const newEmail = "test@example.com";
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: "some-id",
        username: "testuser",
        email: newEmail,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email: newEmail }, undefined);

      const response = await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId: "",
        email: newEmail,
      });
      expect(response.statusCode).toBe(200);
    });

    it("Should handle missing id property by using empty string for userId", async () => {
      const newEmail = "test@example.com";
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: "some-id",
        username: "testuser",
        email: newEmail,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email: newEmail }, {} as UserIdParamsModel);

      const response = await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId: "",
        email: newEmail,
      });
      expect(response.statusCode).toBe(200);
    });

    it("Should handle null params by using empty string for userId", async () => {
      const newEmail = "test@example.com";
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: "some-id",
        username: "testuser",
        email: newEmail,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email: newEmail }, null);

      const response = await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId: "",
        email: newEmail,
      });
      expect(response.statusCode).toBe(200);
    });

    it("Should handle missing body object by passing undefined email", async () => {
      const userId = existingUser.id!;
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: userId,
        username: "testuser",
        email: "test@example.com",
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest(undefined, { id: userId });

      const response = await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: undefined,
      });
      expect(response.statusCode).toBe(200);
    });

    it("Should handle missing email property by passing undefined email", async () => {
      const userId = existingUser.id!;
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: userId,
        username: "testuser",
        email: "test@example.com",
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({} as UpdateUserEmailRequestModel, {
        id: userId,
      });

      const response = await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: undefined,
      });
      expect(response.statusCode).toBe(200);
    });

    it("Should handle null body by passing undefined email", async () => {
      const userId = existingUser.id!;
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: userId,
        username: "testuser",
        email: "test@example.com",
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest(null, { id: userId });

      const response = await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: undefined,
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("Use case error handling", () => {
    it("Should propagate validation errors from use case", async () => {
      const userId = existingUser.id!;
      const newEmail = "test@example.com";
      const customError = new CustomError("shared.error.requiredFields", 400);

      updateUserEmailUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({ email: newEmail }, { id: userId });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: newEmail,
      });
    });

    it("Should propagate user not found errors", async () => {
      const userId = "nonexistent123";
      const newEmail = "test@example.com";
      const customError = new CustomError<IUserTranslation>(
        "user.updateUserEmail.notFound",
        404,
      );

      updateUserEmailUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({ email: newEmail }, { id: userId });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: newEmail,
      });
    });

    it("Should propagate email already registered errors", async () => {
      const userId = existingUser.id!;
      const takenEmail = "taken@example.com";
      const customError = new CustomError<IUserTranslation>(
        "user.updateUserEmail.emailAlreadyRegistered",
        409,
      );

      updateUserEmailUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({ email: takenEmail }, { id: userId });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: takenEmail,
      });
    });

    it("Should propagate update operation errors", async () => {
      const userId = existingUser.id!;
      const newEmail = "test@example.com";
      const customError = new CustomError<IUserTranslation>(
        "user.updateUserEmail.error",
        500,
      );

      updateUserEmailUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({ email: newEmail }, { id: userId });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: newEmail,
      });
    });

    it("Should propagate internal server errors", async () => {
      const userId = existingUser.id!;
      const newEmail = "test@example.com";
      const internalError = new Error("Database connection failed");

      updateUserEmailUseCase.execute.mockRejectedValue(internalError);

      const req = createRequest({ email: newEmail }, { id: userId });

      await expect(controller.handle(req)).rejects.toThrow(internalError);
      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: newEmail,
      });
    });
  });

  describe("Response structure and messages", () => {
    it("Should return correct message for successful update", async () => {
      const userId = existingUser.id!;
      const newEmail = "newemail@example.com";
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: userId,
        username: existingUser.username,
        email: newEmail,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email: newEmail }, { id: userId });

      const response = await controller.handle(req);
      const translatedMessage = getTranslationMessageFromPath(
        languagePack,
        response.message!,
      );

      expect(translatedMessage).toBe("Email updated successfully");
      expect(response.message).toBe("user.updateUserEmail.updated");
    });

    it("Should return response with correct structure", async () => {
      const userId = existingUser.id!;
      const newEmail = "newemail@example.com";
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: userId,
        username: existingUser.username,
        email: newEmail,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email: newEmail }, { id: userId });

      const response = await controller.handle(req);

      expect(response).toMatchObject({
        statusCode: 200,
        message: "user.updateUserEmail.updated",
        data: {
          id: userId,
          username: existingUser.username,
          email: newEmail,
        },
      });

      // Verify data has only the expected fields
      expect(Object.keys(response.data!)).toEqual(["id", "username", "email"]);
    });
  });

  describe("Controller behavior", () => {
    it("Should only call use case once per request", async () => {
      const userId = existingUser.id!;
      const newEmail = "test@example.com";
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: userId,
        username: existingUser.username,
        email: newEmail,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email: newEmail }, { id: userId });

      await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledTimes(1);
      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email: newEmail,
      });
    });

    it("Should handle multiple requests independently", async () => {
      const userId1 = "user1";
      const userId2 = "user2";
      const email1 = "user1@example.com";
      const email2 = "user2@example.com";
      const mockUpdatedUser1: UpdateUserEmailResponseModel = {
        id: userId1,
        username: "username1",
        email: email1,
      };
      const mockUpdatedUser2: UpdateUserEmailResponseModel = {
        id: userId2,
        username: "username2",
        email: email2,
      };

      // First request
      updateUserEmailUseCase.execute.mockResolvedValueOnce(mockUpdatedUser1);
      const req1 = createRequest({ email: email1 }, { id: userId1 });
      const response1 = await controller.handle(req1);

      // Second request
      updateUserEmailUseCase.execute.mockResolvedValueOnce(mockUpdatedUser2);
      const req2 = createRequest({ email: email2 }, { id: userId2 });
      const response2 = await controller.handle(req2);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledTimes(2);
      expect(updateUserEmailUseCase.execute).toHaveBeenNthCalledWith(1, {
        userId: userId1,
        email: email1,
      });
      expect(updateUserEmailUseCase.execute).toHaveBeenNthCalledWith(2, {
        userId: userId2,
        email: email2,
      });

      expect(response1.data?.id).toBe(userId1);
      expect(response2.data?.id).toBe(userId2);
    });
  });

  describe("Status code validation", () => {
    it("Should return exactly 200 for successful update", async () => {
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: "test-id",
        username: "testuser",
        email: "new@example.com",
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest(
        { email: "new@example.com" },
        { id: "test-id" },
      );

      const response = await controller.handle(req);

      expect(response.statusCode).toBe(200);
      expect(response.statusCode).not.toBe(201);
      expect(response.statusCode).not.toBe(204);
    });
  });

  describe("Data passthrough validation", () => {
    it("Should pass exact parameters to use case", async () => {
      const userId = "specific-user-id";
      const email = "specific@example.com";
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: userId,
        username: "testuser",
        email,
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest({ email }, { id: userId });

      await controller.handle(req);

      expect(updateUserEmailUseCase.execute).toHaveBeenCalledWith({
        userId,
        email,
      });
    });

    it("Should return exact data from use case", async () => {
      const mockUpdatedUser: UpdateUserEmailResponseModel = {
        id: "exact-id",
        username: "exact-username",
        email: "exact@email.com",
      };

      updateUserEmailUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const req = createRequest(
        { email: "test@example.com" },
        { id: "test-id" },
      );

      const response = await controller.handle(req);

      expect(response.data).toBe(mockUpdatedUser);
      expect(response.data).toEqual(mockUpdatedUser);
    });
  });
});
