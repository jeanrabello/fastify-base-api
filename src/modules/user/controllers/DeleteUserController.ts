import { AbstractController } from "@src/shared/classes/AbstractController";
import { IUserTranslation } from "../types/IUserTranslation";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { FindUserByIdUseCase } from "../useCases/FindUserByIdUseCase";
import { DeleteUserByIdUseCase } from "../useCases/DeleteUserByIdUseCase";

interface IDeleteUserController {
  findUserByIdUseCase: any;
  deleteUserByIdUseCase: any;
}

export class DeleteUserController extends AbstractController<
  null,
  IUserTranslation
> {
  private findUserByIdUseCase: FindUserByIdUseCase;
  private deleteUserByIdUseCase: DeleteUserByIdUseCase;

  constructor(dependencies: IDeleteUserController) {
    super();
    this.findUserByIdUseCase = dependencies.findUserByIdUseCase;
    this.deleteUserByIdUseCase = dependencies.deleteUserByIdUseCase;
  }

  async handle(
    request: HttpRequest<null, IUserTranslation>,
  ): Promise<HttpResponse<IUserTranslation, any>> {
    const userRequestId = request.params?.id;
    const user = await this.findUserByIdUseCase.execute(userRequestId);
    if (!user) {
      return {
        statusCode: 404,
        message: "user.deleteUser.notFound",
      };
    }
    const isDeleted = await this.deleteUserByIdUseCase.execute(user.id);
    return {
      statusCode: isDeleted ? 200 : 400,
      message: `user.deleteUser.${isDeleted ? "deleted" : "error"}`,
    };
  }
}
