import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { SignupRequestModel } from "../models/Request/SignupRequest.model";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { SignupUseCase } from "@modules/auth/useCases/SignupUseCase";

interface ISignupController {
  signupUseCase: SignupUseCase;
}

export class SignupController extends AbstractController<
  IAuthTranslation,
  SignupRequestModel
> {
  private signupUseCase: SignupUseCase;

  constructor(dependencies: ISignupController) {
    super();
    this.signupUseCase = dependencies.signupUseCase;
  }

  async handle(
    request: HttpRequest<
      SignupRequestModel,
      undefined,
      undefined,
      IAuthTranslation
    >,
  ): Promise<HttpResponse<IAuthTranslation>> {
    const signup = request.body!;
    const result = await this.signupUseCase.execute(signup);
    return {
      statusCode: 201,
      message: "auth.signup.success",
      data: result,
    };
  }
}
