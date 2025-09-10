import { AbstractController } from "@src/shared/classes/AbstractController";
import { IUserTranslation } from "../types/IUserTranslation";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { FindUserByIdUseCase } from "../useCases/FindUserByIdUseCase";
import { DeleteUserByIdUseCase } from "../useCases/DeleteUserByIdUseCase";

interface IDeleteUserController {
  findUserByIdUseCase: FindUserByIdUseCase;
  deleteUserByIdUseCase: DeleteUserByIdUseCase;
}

import { UserIdParamsModel } from "@modules/user/models/Request/UserIdParams.model";

export class DeleteUserController extends AbstractController<
  IUserTranslation,
  null,
  UserIdParamsModel
> {
  private findUserByIdUseCase: FindUserByIdUseCase;
  private deleteUserByIdUseCase: DeleteUserByIdUseCase;

  constructor(dependencies: IDeleteUserController) {
    super();
    this.findUserByIdUseCase = dependencies.findUserByIdUseCase;
    this.deleteUserByIdUseCase = dependencies.deleteUserByIdUseCase;
  }

  async handle(
    request: HttpRequest<null, UserIdParamsModel, undefined, IUserTranslation>,
  ): Promise<HttpResponse<IUserTranslation, any>> {
    const userRequestId = request.params?.id || "";
    const user = await this.findUserByIdUseCase.execute(userRequestId);
    if (!user) {
      return {
        statusCode: 404,
        message: "user.deleteUser.notFound",
      };
    }
    const currentUserId = request.user?.id;
    const isDeleted = await this.deleteUserByIdUseCase.execute(
      userRequestId,
      currentUserId,
    );
    return {
      statusCode: isDeleted ? 200 : 400,
      message: `user.deleteUser.${isDeleted ? "deleted" : "error"}`,
    };
  }
}
