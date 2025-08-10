import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { CreateUserRequestModel } from "../models/Request/CreateUserRequest.model";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { CreateUserUseCase } from "@modules/user/useCases/CreateUserUseCase";

interface ICreateUserController {
  createUserUseCase: CreateUserUseCase;
}

export class CreateUserController extends AbstractController<
  CreateUserRequestModel,
  IUserTranslation
> {
  private createUserUseCase: CreateUserUseCase;

  constructor(dependencies: ICreateUserController) {
    super();
    this.createUserUseCase = dependencies.createUserUseCase;
  }

  async handle(
    request: HttpRequest<CreateUserRequestModel, IUserTranslation>,
  ): Promise<HttpResponse<IUserTranslation>> {
    const newUser = request.body as CreateUserRequestModel;
    const user = await this.createUserUseCase.execute(newUser);
    return {
      statusCode: 201,
      message: "user.createUser.created",
      data: user,
    };
  }
}
