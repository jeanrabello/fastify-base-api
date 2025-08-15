import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { PaginationParams } from "@src/shared/types/pagination";
import { ListUsersPaginatedResponseModel } from "@modules/user/models/Response/ListUsersPaginatedResponse.model";
import { ListUsersPaginatedParamsModel } from "@modules/user/models/Request/ListUsersPaginatedParams.model";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { ListUsersPaginatedUseCase } from "@modules/user/useCases/ListUsersPaginatedUseCase";

interface IListUsersControllerDeps {
  listUsersUseCase: ListUsersPaginatedUseCase;
}

export class ListUsersController extends AbstractController<
  IUserTranslation,
  null,
  {},
  ListUsersPaginatedParamsModel
> {
  private listUsersUseCase: ListUsersPaginatedUseCase;

  constructor(dependencies: IListUsersControllerDeps) {
    super();
    this.listUsersUseCase = dependencies.listUsersUseCase;
  }

  async handle(
    request: HttpRequest<
      null,
      {},
      ListUsersPaginatedParamsModel,
      IUserTranslation
    >,
  ): Promise<HttpResponse<IUserTranslation, ListUsersPaginatedResponseModel>> {
    const { page = 1, size = 10 } = request.query!;
    const params: PaginationParams = { page: Number(page), size: Number(size) };

    const pageResultRaw = await this.listUsersUseCase.execute(params);

    const pageResult: ListUsersPaginatedResponseModel = {
      ...pageResultRaw,
      content: pageResultRaw.content.map((u) => ({
        id: u.id!,
        username: u.username!,
        email: u.email!,
        createdAt: u.createdAt!,
      })),
    };

    return {
      statusCode: 200,
      message: "user.listUsers.success",
      data: pageResult,
    };
  }
}
