import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { FindUserByIdUseCase } from "../useCases/FindUserByIdUseCase";
import { FindUserByIdResponseModel } from "../models/Response/FindUserByIdResponse.model";

interface IFindCurrentUserController {
  findUserByIdUseCase: FindUserByIdUseCase;
}

export class FindCurrentUserController extends AbstractController<IUserTranslation> {
  private findUserByIdUseCase: FindUserByIdUseCase;

  constructor(dependencies: IFindCurrentUserController) {
    super();
    this.findUserByIdUseCase = dependencies.findUserByIdUseCase;
  }

  async handle(
    request: HttpRequest<undefined, undefined, undefined, IUserTranslation>,
  ): Promise<HttpResponse<IUserTranslation, FindUserByIdResponseModel | null>> {
    const userId = request.user?.id || "";
    const user = await this.findUserByIdUseCase.execute(userId);
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
