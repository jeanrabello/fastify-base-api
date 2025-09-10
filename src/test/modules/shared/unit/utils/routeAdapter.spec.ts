import { routeAdapter } from "@src/shared/utils/routeAdapter";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { Translation } from "@src/shared/types/lang";
import { IModel } from "@src/shared/classes/IModel";
import { FastifyRequest, FastifyReply } from "fastify";

// Mock do FastifyRequest e FastifyReply
const mockRequest = {
  languagePack: {
    shared: {
      error: {
        invalidFields: "Invalid fields",
        requiredFields: "Required fields not filled",
        tokenExpired: "Token expired",
        tokenNotFound: "Token not found",
        internalServerError: "Internal server error",
        noMessageSpecified: "No message specified",
        invalidToken: "Invalid token",
        authorizationRequired: "Authorization required",
        invalidAuthorizationFormat: "Invalid authorization format",
      },
    },
  } as Translation,
  body: { testData: "test" },
  params: { id: "123" },
  query: { page: "1" },
} as unknown as FastifyRequest;

const mockReply = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
} as unknown as FastifyReply;

// Mock do AbstractController
class MockController extends AbstractController<Translation> {
  async handle(
    request: HttpRequest<IModel, Translation>,
  ): Promise<HttpResponse<Translation>> {
    return {
      statusCode: 200,
      message: "shared.error.internalServerError",
      data: { success: true },
    };
  }
}

describe("routeAdapter", () => {
  let mockController: MockController;
  let handleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockController = new MockController();
    handleSpy = jest.spyOn(mockController, "handle");
    jest.clearAllMocks();
  });

  describe("Success responses (2xx)", () => {
    it("Should handle successful response with status 200", async () => {
      const successResponse: HttpResponse<Translation> = {
        statusCode: 200,
        message: "shared.error.internalServerError",
        data: { success: true },
      };

      handleSpy.mockResolvedValue(successResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockController.languagePack).toBe(mockRequest.languagePack);
      expect(handleSpy).toHaveBeenCalledWith(mockRequest);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        statusCode: 200,
        message: "shared.error.internalServerError",
        data: { success: true },
      });
    });

    it("Should handle successful response with status 201", async () => {
      const successResponse: HttpResponse<Translation> = {
        statusCode: 201,
        message: "shared.error.internalServerError",
        data: { id: "new-id" },
      };

      handleSpy.mockResolvedValue(successResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        statusCode: 201,
        message: "shared.error.internalServerError",
        data: { id: "new-id" },
      });
    });

    it("Should handle successful response with status 299 (edge case)", async () => {
      const successResponse: HttpResponse<Translation> = {
        statusCode: 299,
        message: "shared.error.internalServerError",
        data: null,
      };

      handleSpy.mockResolvedValue(successResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(299);
      expect(mockReply.send).toHaveBeenCalledWith({
        statusCode: 299,
        message: "shared.error.internalServerError",
        data: null,
      });
    });

    it("Should handle successful response without message", async () => {
      const successResponse: HttpResponse<Translation> = {
        statusCode: 200,
        data: { success: true },
      };

      handleSpy.mockResolvedValue(successResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        statusCode: 200,
        message: undefined,
        data: { success: true },
      });
    });

    it("Should handle successful response without data", async () => {
      const successResponse: HttpResponse<Translation> = {
        statusCode: 204,
        message: "shared.error.internalServerError",
      };

      handleSpy.mockResolvedValue(successResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalledWith({
        statusCode: 204,
        message: "shared.error.internalServerError",
        data: undefined,
      });
    });
  });

  describe("Error responses (non-2xx)", () => {
    it("Should handle client error response with status 400", async () => {
      const errorResponse: HttpResponse<Translation> = {
        statusCode: 400,
        message: "shared.error.invalidFields",
      };

      handleSpy.mockResolvedValue(errorResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockController.languagePack).toBe(mockRequest.languagePack);
      expect(handleSpy).toHaveBeenCalledWith(mockRequest);
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "shared.error.invalidFields",
      });
    });

    it("Should handle unauthorized error response with status 401", async () => {
      const errorResponse: HttpResponse<Translation> = {
        statusCode: 401,
        message: "shared.error.authorizationRequired",
      };

      handleSpy.mockResolvedValue(errorResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "shared.error.authorizationRequired",
      });
    });

    it("Should handle not found error response with status 404", async () => {
      const errorResponse: HttpResponse<Translation> = {
        statusCode: 404,
        message: "shared.error.tokenNotFound",
      };

      handleSpy.mockResolvedValue(errorResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "shared.error.tokenNotFound",
      });
    });

    it("Should handle server error response with status 500", async () => {
      const errorResponse: HttpResponse<Translation> = {
        statusCode: 500,
        message: "shared.error.internalServerError",
      };

      handleSpy.mockResolvedValue(errorResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "shared.error.internalServerError",
      });
    });

    it("Should handle error response without message", async () => {
      const errorResponse: HttpResponse<Translation> = {
        statusCode: 400,
      };

      handleSpy.mockResolvedValue(errorResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: undefined,
      });
    });
  });

  describe("Edge cases", () => {
    it("Should handle status code 199 as error (just below 2xx range)", async () => {
      const errorResponse: HttpResponse<Translation> = {
        statusCode: 199,
        message: "shared.error.internalServerError",
      };

      handleSpy.mockResolvedValue(errorResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(199);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "shared.error.internalServerError",
      });
    });

    it("Should handle status code 300 as error (just above 2xx range)", async () => {
      const errorResponse: HttpResponse<Translation> = {
        statusCode: 300,
        message: "shared.error.internalServerError",
      };

      handleSpy.mockResolvedValue(errorResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      expect(mockReply.status).toHaveBeenCalledWith(300);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "shared.error.internalServerError",
      });
    });

    it("Should set languagePack on controller before handling request", async () => {
      const successResponse: HttpResponse<Translation> = {
        statusCode: 200,
        data: { success: true },
      };

      handleSpy.mockResolvedValue(successResponse);

      // Verificar se languagePack estava undefined antes
      expect(mockController.languagePack).toBeUndefined();

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      // Verificar se foi definido após a chamada
      expect(mockController.languagePack).toBe(mockRequest.languagePack);
    });

    it("Should cast request properly to HttpRequest type", async () => {
      const successResponse: HttpResponse<Translation> = {
        statusCode: 200,
        data: { success: true },
      };

      handleSpy.mockResolvedValue(successResponse);

      const adaptedRoute = routeAdapter(mockController);
      await adaptedRoute(mockRequest, mockReply);

      // Verificar se o handle foi chamado com o request correto
      expect(handleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          languagePack: mockRequest.languagePack,
          body: mockRequest.body,
          params: mockRequest.params,
          query: mockRequest.query,
        }),
      );
    });
  });

  describe("Error handling", () => {
    it("Should propagate errors thrown by controller", async () => {
      const error = new Error("Controller error");
      handleSpy.mockRejectedValue(error);

      const adaptedRoute = routeAdapter(mockController);

      await expect(adaptedRoute(mockRequest, mockReply)).rejects.toThrow(
        "Controller error",
      );
    });

    it("Should propagate async errors thrown by controller", async () => {
      const error = new Error("Async controller error");
      handleSpy.mockImplementation(async () => {
        throw error;
      });

      const adaptedRoute = routeAdapter(mockController);

      await expect(adaptedRoute(mockRequest, mockReply)).rejects.toThrow(
        "Async controller error",
      );
    });
  });
});
