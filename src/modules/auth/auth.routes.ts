import { FastifyTypedInstance } from "@src/shared/types/fastifyTypedInstance";
import { routeAdapter } from "@utils/routeAdapter";

// Controllers
import { LoginController } from "@modules/auth/controllers/LoginController";
import { SignupController } from "@modules/auth/controllers/SignupController";
import { ValidateTokenController } from "@modules/auth/controllers/ValidateTokenController";
import { RefreshTokenController } from "@modules/auth/controllers/RefreshTokenController";

// Use Cases
import { LoginUseCase } from "@modules/auth/useCases/LoginUseCase";
import { SignupUseCase } from "@modules/auth/useCases/SignupUseCase";
import { ValidateTokenUseCase } from "@modules/auth/useCases/ValidateTokenUseCase";
import { RefreshTokenUseCase } from "@modules/auth/useCases/RefreshTokenUseCase";

// Services
import { JWTAuthService } from "@src/shared/services/JWTAuthService";

// Repositories
import { MongoCredentialRepository } from "@src/infra/mongo/repositories/credential/MongoCredentialRepository";
import { MongoUserRepository } from "@src/infra/mongo/repositories/user/MongoUserRepository";

// Schemas
import {
  loginSchema,
  signupSchema,
  validateTokenSchema,
  refreshTokenSchema,
} from "@modules/auth/schemas";

const authRoutes = (app: FastifyTypedInstance) => {
  // Signup
  app.post(
    "/signup",
    signupSchema,
    routeAdapter(
      new SignupController({
        signupUseCase: new SignupUseCase({
          userRepository: new MongoUserRepository(),
          credentialRepository: new MongoCredentialRepository(),
        }),
      }),
    ),
  );

  // Login
  app.post(
    "/login",
    loginSchema,
    routeAdapter(
      new LoginController({
        loginUseCase: new LoginUseCase({
          authService: new JWTAuthService(),
          credentialRepository: new MongoCredentialRepository(),
        }),
      }),
    ),
  );

  // Validate Token
  app.get(
    "/validate",
    validateTokenSchema,
    routeAdapter(
      new ValidateTokenController({
        validateTokenUseCase: new ValidateTokenUseCase({
          authService: new JWTAuthService(),
        }),
      }),
    ),
  );

  // Refresh Token
  app.post(
    "/refresh",
    refreshTokenSchema,
    routeAdapter(
      new RefreshTokenController({
        refreshTokenUseCase: new RefreshTokenUseCase({
          authService: new JWTAuthService(),
        }),
      }),
    ),
  );
};

export { authRoutes };
