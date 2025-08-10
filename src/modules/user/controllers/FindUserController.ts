import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { FindUserByIdUseCase } from "../useCases/FindUserByIdUseCase";
import { FindUserByIdResponseModel } from "../models/Response/FindUserByIdResponse.model";

interface IFindUserByIdController {
  findUserByIdUseCase: FindUserByIdUseCase;
}

export class FindUserController extends AbstractController<
  null,
  IUserTranslation
> {
  private findUserByIdUseCase: FindUserByIdUseCase;

  constructor(dependencies: IFindUserByIdController) {
    super();
    this.findUserByIdUseCase = dependencies.findUserByIdUseCase;
  }

  async handle(
    request: HttpRequest<null, IUserTranslation>,
  ): Promise<HttpResponse<IUserTranslation, FindUserByIdResponseModel | null>> {
    const userRequestId = request.params?.id;
    const user = await this.findUserByIdUseCase.execute(userRequestId);
    return {
      statusCode: 200,
      data: user,
      message: "user.findUser.found",
    };
  }
}
