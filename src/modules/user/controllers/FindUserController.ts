import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { FindUserByIdUseCase } from "../useCases/FindUserByIdUseCase";
import { FindUserByIdResponseModel } from "../models/Response/FindUserByIdResponse.model";

interface IFindUserByIdController {
  findUserByIdUseCase: FindUserByIdUseCase;
}

import { UserIdParamsModel } from "@modules/user/models/Request/UserIdParams.model";

export class FindUserController extends AbstractController<
  IUserTranslation,
  null,
  UserIdParamsModel
> {
  private findUserByIdUseCase: FindUserByIdUseCase;

  constructor(dependencies: IFindUserByIdController) {
    super();
    this.findUserByIdUseCase = dependencies.findUserByIdUseCase;
  }

  async handle(
    request: HttpRequest<null, UserIdParamsModel, undefined, IUserTranslation>,
  ): Promise<HttpResponse<IUserTranslation, FindUserByIdResponseModel | null>> {
    const userRequestId = request.params?.id || "";
    const user = await this.findUserByIdUseCase.execute(userRequestId);
    if (!user) {
      return {
        statusCode: 404,
        message: "user.findUser.notFound",
      };
    }
    return {
      statusCode: 200,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      } as FindUserByIdResponseModel,
      message: "user.findUser.found",
    };
  }
}
