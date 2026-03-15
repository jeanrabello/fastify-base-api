import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import CustomError from "@src/shared/classes/CustomError";
import { Translation } from "@src/shared/types/lang";
import { JWTAuthService } from "@src/shared/services/JWTAuthService";

export default async function authMiddleware(app: FastifyInstance) {
  const authenticateToken = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      const authorization = request.headers.authorization;

      if (!authorization) {
        throw new CustomError<Translation>(
          "shared.error.authorizationRequired",
          401,
        );
      }

      if (!authorization.startsWith("Bearer ")) {
        throw new CustomError<Translation>(
          "shared.error.invalidAuthorizationFormat",
          401,
        );
      }

      const token = authorization.substring(7);

      if (!token || token.trim() === "") {
        throw new CustomError<Translation>("shared.error.tokenNotFound", 401);
      }

      const authService = new JWTAuthService();

      const decodedToken = authService.verifyToken(token);

      if (!decodedToken || !decodedToken.id || !decodedToken.email) {
        throw new CustomError<Translation>("shared.error.invalidToken", 401);
      }

      request.user = {
        id: decodedToken.id,
        email: decodedToken.email,
        iat: decodedToken.iat,
        exp: decodedToken.exp,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError<Translation>("shared.error.invalidToken", 401);
    }
  };

  const optionalAuthenticateToken = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    try {
      const authorization = request.headers.authorization;

      if (!authorization || !authorization.startsWith("Bearer ")) {
        return;
      }

      const token = authorization.substring(7);

      if (!token || token.trim() === "") {
        return;
      }

      const authService = new JWTAuthService();
      const decodedToken = authService.verifyToken(token);

      if (decodedToken && decodedToken.id && decodedToken.email) {
        request.user = {
          id: decodedToken.id,
          email: decodedToken.email,
          iat: decodedToken.iat,
          exp: decodedToken.exp,
        };
      }
    } catch (error) {
      // In case of an error with the optional token, just ignore and continue
      // Do not block the request
    }
  };

  app.decorate("authenticate", authenticateToken);
  app.decorate("optionalAuthenticate", optionalAuthenticateToken);
}

export function isAuthenticated(request: FastifyRequest): boolean {
  return !!request.user;
}

export function getCurrentUser(request: FastifyRequest) {
  if (!request.user) {
    throw new CustomError<Translation>(
      "shared.error.authorizationRequired",
      401,
    );
  }
  return request.user;
}
