import { AbstractController } from "@src/shared/classes/AbstractController";
import { IUserTranslation } from "../types/IUserTranslation";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { UpdateUserEmailRequestModel } from "../models/Request/UpdateUserEmailRequest.model";
import { UpdateUserEmailResponseModel } from "../models/Response/UpdateUserEmailResponse.model";
import { UpdateUserEmailUseCase } from "../useCases/UpdateUserEmailUseCase";
import { UserIdParamsModel } from "../models/Request/UserIdParams.model";

interface IUpdateUserEmailController {
  updateUserEmailUseCase: UpdateUserEmailUseCase;
}

export class UpdateUserEmailController extends AbstractController<
  IUserTranslation,
  UpdateUserEmailRequestModel,
  UserIdParamsModel
> {
  private updateUserEmailUseCase: UpdateUserEmailUseCase;

  constructor(dependencies: IUpdateUserEmailController) {
    super();
    this.updateUserEmailUseCase = dependencies.updateUserEmailUseCase;
  }

  async handle(
    request: HttpRequest<
      UpdateUserEmailRequestModel,
      UserIdParamsModel,
      undefined,
      IUserTranslation
    >,
  ): Promise<HttpResponse<IUserTranslation, UpdateUserEmailResponseModel>> {
    const userId = request.params?.id || "";
    const email = request.body?.email;
    const updatedUser = await this.updateUserEmailUseCase.execute({
      userId,
      email,
    });
    return {
      statusCode: 200,
      data: updatedUser,
      message: "user.updateUserEmail.updated",
    };
  }
}
