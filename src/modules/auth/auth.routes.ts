import { FastifyTypedInstance } from "@src/shared/types/fastifyTypedInstance";
import { routeAdapter } from "@utils/routeAdapter";

// Controllers
import { LoginController } from "@modules/auth/controllers/LoginController";
import { ValidateTokenController } from "@modules/auth/controllers/ValidateTokenController";
import { RefreshTokenController } from "@modules/auth/controllers/RefreshTokenController";

// Use Cases
import { LoginUseCase } from "@modules/auth/useCases/LoginUseCase";
import { ValidateTokenUseCase } from "@modules/auth/useCases/ValidateTokenUseCase";
import { RefreshTokenUseCase } from "@modules/auth/useCases/RefreshTokenUseCase";

// Services
import { JWTAuthService } from "@src/shared/services/JWTAuthService";
import { UserService } from "@src/shared/services/UserService";

// Schemas
import {
  loginSchema,
  validateTokenSchema,
  refreshTokenSchema,
} from "@modules/auth/schemas";

const authRoutes = (app: FastifyTypedInstance) => {
  // Login
  app.post(
    "/login",
    loginSchema,
    routeAdapter(
      new LoginController({
        loginUseCase: new LoginUseCase({
          authService: new JWTAuthService(),
          userService: new UserService(),
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
