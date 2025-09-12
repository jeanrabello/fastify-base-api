import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { RefreshTokenUseCase } from "@modules/auth/useCases/RefreshTokenUseCase";
import { RefreshTokenResponseModel } from "../models/Response/RefreshTokenResponse.model";

interface IRefreshTokenController {
  refreshTokenUseCase: RefreshTokenUseCase;
}

export class RefreshTokenController extends AbstractController<IAuthTranslation> {
  private refreshTokenUseCase: RefreshTokenUseCase;

  constructor(dependencies: IRefreshTokenController) {
    super();
    this.refreshTokenUseCase = dependencies.refreshTokenUseCase;
  }

  async handle(
    request: HttpRequest<undefined, undefined, undefined, IAuthTranslation>,
  ): Promise<HttpResponse<IAuthTranslation, RefreshTokenResponseModel>> {
    const refreshTokenData = request.headers.authorization || "";
    const result = await this.refreshTokenUseCase.execute(refreshTokenData);
    return {
      statusCode: 200,
      message: "auth.refreshToken.success",
      data: result,
    };
  }
}
