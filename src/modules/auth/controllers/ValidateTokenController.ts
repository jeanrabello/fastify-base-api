import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { ValidateTokenUseCase } from "@modules/auth/useCases/ValidateTokenUseCase";

interface IValidateTokenController {
  validateTokenUseCase: ValidateTokenUseCase;
}

export class ValidateTokenController extends AbstractController<IAuthTranslation> {
  private validateTokenUseCase: ValidateTokenUseCase;

  constructor(dependencies: IValidateTokenController) {
    super();
    this.validateTokenUseCase = dependencies.validateTokenUseCase;
  }

  async handle(
    request: HttpRequest<undefined, undefined, undefined, IAuthTranslation>,
  ): Promise<HttpResponse<IAuthTranslation>> {
    const tokenData = request.headers.authorization || "";
    const result = await this.validateTokenUseCase.execute(tokenData);

    return {
      statusCode: 200,
      message: "auth.validateToken.success",
      data: result,
    };
  }
}
