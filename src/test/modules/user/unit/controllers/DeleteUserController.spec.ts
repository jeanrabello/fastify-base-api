import { DeleteUserController } from "@modules/user/controllers/DeleteUserController";
import { FindUserByIdUseCase } from "@modules/user/useCases/FindUserByIdUseCase";
import { DeleteUserByIdUseCase } from "@modules/user/useCases/DeleteUserByIdUseCase";
import enUs from "@modules/user/lang/en-us";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { existingUser } from "../../mocks/entities";
import { UserIdParamsModel } from "@modules/user/models/Request/UserIdParams.model";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";
import CustomError from "@src/shared/classes/CustomError";

describe("DeleteUserController", () => {
  let controller: DeleteUserController;
  let findUserByIdUseCase: jest.Mocked<FindUserByIdUseCase>;
  let deleteUserByIdUseCase: jest.Mocked<DeleteUserByIdUseCase>;
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

    deleteUserByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteUserByIdUseCase>;

    controller = new DeleteUserController({
      findUserByIdUseCase,
      deleteUserByIdUseCase,
    });
  });

  describe("Successful deletion", () => {
    it("Should return status 200 when user exists and is deleted successfully", async () => {
      const userId = existingUser.id!;
      const mockUser = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);
      deleteUserByIdUseCase.execute.mockResolvedValue(true);

      const req = createRequest({ id: userId });

      const response: HttpResponse<IUserTranslation, any> =
        await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(deleteUserByIdUseCase.execute).toHaveBeenCalledWith(
        userId,
        undefined,
      );
      expect(response).toEqual({
        statusCode: 200,
        message: "user.deleteUser.deleted",
      });
    });
  });

  describe("User not found", () => {
    it("Should return status 404 when user does not exist", async () => {
      const userId = "nonexistent123";

      findUserByIdUseCase.execute.mockResolvedValue(null);

      const req = createRequest({ id: userId });

      const response: HttpResponse<IUserTranslation, any> =
        await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(deleteUserByIdUseCase.execute).not.toHaveBeenCalled();
      expect(response).toEqual({
        statusCode: 404,
        message: "user.deleteUser.notFound",
      });
    });
  });

  describe("Delete operation failure", () => {
    it("Should return status 400 when user exists but deletion fails", async () => {
      const userId = existingUser.id!;
      const mockUser = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);
      deleteUserByIdUseCase.execute.mockResolvedValue(false);

      const req = createRequest({ id: userId });

      const response: HttpResponse<IUserTranslation, any> =
        await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(deleteUserByIdUseCase.execute).toHaveBeenCalledWith(
        userId,
        undefined,
      );
      expect(response).toEqual({
        statusCode: 400,
        message: "user.deleteUser.error",
      });
    });
  });

  describe("Parameter handling", () => {
    it("Should handle missing params object by using empty string", async () => {
      findUserByIdUseCase.execute.mockResolvedValue(null);

      const req = createRequest(undefined);

      const response: HttpResponse<IUserTranslation, any> =
        await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("");
      expect(response.statusCode).toBe(404);
    });

    it("Should handle missing id property by using empty string", async () => {
      findUserByIdUseCase.execute.mockResolvedValue(null);

      const req = createRequest({} as UserIdParamsModel);

      const response: HttpResponse<IUserTranslation, any> =
        await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("");
      expect(response.statusCode).toBe(404);
    });

    it("Should handle null params by using empty string", async () => {
      findUserByIdUseCase.execute.mockResolvedValue(null);

      const req = createRequest(null);

      const response: HttpResponse<IUserTranslation, any> =
        await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith("");
      expect(response.statusCode).toBe(404);
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
      expect(deleteUserByIdUseCase.execute).not.toHaveBeenCalled();
    });

    it("Should propagate errors from DeleteUserByIdUseCase", async () => {
      const userId = existingUser.id!;
      const mockUser = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };
      const customError = new CustomError(
        "shared.error.internalServerError",
        500,
      );

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);
      deleteUserByIdUseCase.execute.mockRejectedValue(customError);

      const req = createRequest({ id: userId });

      await expect(controller.handle(req)).rejects.toThrow(customError);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(userId);
      expect(deleteUserByIdUseCase.execute).toHaveBeenCalledWith(
        userId,
        undefined,
      );
    });
  });

  describe("Response message consistency", () => {
    it("Should return correct message for successful deletion", async () => {
      const userId = existingUser.id!;
      const mockUser = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);
      deleteUserByIdUseCase.execute.mockResolvedValue(true);

      const req = createRequest({ id: userId });

      const response = await controller.handle(req);
      const translatedMessage = getTranslationMessageFromPath(
        languagePack,
        response.message!,
      );

      expect(translatedMessage).toBe("User deleted successfully");
    });

    it("Should return correct message for deletion failure", async () => {
      const userId = existingUser.id!;
      const mockUser = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);
      deleteUserByIdUseCase.execute.mockResolvedValue(false);

      const req = createRequest({ id: userId });

      const response = await controller.handle(req);
      const translatedMessage = getTranslationMessageFromPath(
        languagePack,
        response.message!,
      );

      expect(translatedMessage).toBe("Error deleting user");
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
    });
  });

  describe("Use case call sequence", () => {
    it("Should always call FindUserByIdUseCase first", async () => {
      const userId = existingUser.id!;
      const mockUser = {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      };

      let findCalled = false;
      let deleteCalled = false;

      findUserByIdUseCase.execute.mockImplementation(async () => {
        findCalled = true;
        expect(deleteCalled).toBe(false); // Delete should not be called yet
        return mockUser;
      });

      deleteUserByIdUseCase.execute.mockImplementation(async () => {
        deleteCalled = true;
        expect(findCalled).toBe(true); // Find should be called first
        return true;
      });

      const req = createRequest({ id: userId });

      await controller.handle(req);

      expect(findCalled).toBe(true);
      expect(deleteCalled).toBe(true);
    });

    it("Should not call DeleteUserByIdUseCase when user is not found", async () => {
      const userId = "nonexistent123";

      findUserByIdUseCase.execute.mockResolvedValue(null);

      const req = createRequest({ id: userId });

      await controller.handle(req);

      expect(findUserByIdUseCase.execute).toHaveBeenCalledTimes(1);
      expect(deleteUserByIdUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
