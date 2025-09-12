import { AbstractController } from "@src/shared/classes/AbstractController";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { IUserTranslation } from "../types/IUserTranslation";
import { VerifyUserCredentialsRequestModel } from "../models/Request/VerifyUserCredentialsRequest.model";
import { VerifyUserCredentialsResponseModel } from "../models/Response/VerifyUserCredentialsResponse.model";
import { VerifyUserCredentialsUseCase } from "../useCases/VerifyUserCredentialsUseCase";

export interface IVerifyUserCredentialsController {
  verifyUserCredentialsUseCase: VerifyUserCredentialsUseCase;
}

export class VerifyUserCredentialsController extends AbstractController<
  IUserTranslation,
  VerifyUserCredentialsRequestModel
> {
  private readonly verifyUserCredentialsUseCase: VerifyUserCredentialsUseCase;

  constructor(deps: IVerifyUserCredentialsController) {
    super();
    this.verifyUserCredentialsUseCase = deps.verifyUserCredentialsUseCase;
  }

  async handle(
    request: HttpRequest<
      VerifyUserCredentialsRequestModel,
      undefined,
      undefined,
      IUserTranslation
    >,
  ): Promise<
    HttpResponse<IUserTranslation, VerifyUserCredentialsResponseModel>
  > {
    const email = request.body?.email || "";
    const password = request.body?.password || "";

    const result = await this.verifyUserCredentialsUseCase.execute({
      email,
      password,
    });

    return {
      statusCode: 200,
      message: "user.findUser.found",
      data: result,
    };
  }
}
