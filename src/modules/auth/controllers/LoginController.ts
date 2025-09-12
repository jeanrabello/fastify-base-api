import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { LoginRequestModel } from "../models/Request/LoginRequest.model";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { LoginUseCase } from "@modules/auth/useCases/LoginUseCase";
import { recordAuthAttempt } from "@src/observability/metrics";
import logger from "@src/observability/logger";

interface ILoginController {
  loginUseCase: LoginUseCase;
}

export class LoginController extends AbstractController<
  IAuthTranslation,
  LoginRequestModel
> {
  private loginUseCase: LoginUseCase;

  constructor(dependencies: ILoginController) {
    super();
    this.loginUseCase = dependencies.loginUseCase;
  }

  async handle(
    request: HttpRequest<
      LoginRequestModel,
      undefined,
      undefined,
      IAuthTranslation
    >,
  ): Promise<HttpResponse<IAuthTranslation>> {
    const login = request.body!;
    
    try {
      const result = await this.loginUseCase.execute(login);
      recordAuthAttempt(true);
      logger.info({ email: login.email }, "Successful login attempt");
      
      return {
        statusCode: 200,
        message: "auth.login.success",
        data: result,
      };
    } catch (error) {
      recordAuthAttempt(false, "invalid_credentials");
      logger.warn({ email: login.email, error }, "Failed login attempt");
      throw error;
    }
  }
}
