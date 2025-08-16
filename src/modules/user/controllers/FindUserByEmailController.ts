import { AbstractController } from "@src/shared/classes/AbstractController";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { IUserTranslation } from "../types/IUserTranslation";
import { FindUserByEmailRequestModel } from "../models/Request/FindUserByEmailRequest.model";
import { FindUserByEmailUseCase } from "../useCases/FindUserByEmailUseCase";
import CustomError from "@src/shared/classes/CustomError";

export interface IFindUserByEmailController {
  findUserByEmailUseCase: FindUserByEmailUseCase;
}

export class FindUserByEmailController extends AbstractController<
  IUserTranslation,
  FindUserByEmailRequestModel
> {
  private readonly findUserByEmailUseCase: FindUserByEmailUseCase;

  constructor(deps: IFindUserByEmailController) {
    super();
    this.findUserByEmailUseCase = deps.findUserByEmailUseCase;
  }

  async handle(
    request: HttpRequest<FindUserByEmailRequestModel, IUserTranslation>,
  ): Promise<HttpResponse<IUserTranslation>> {
    const email = request.body?.email;
    const user = await this.findUserByEmailUseCase.execute(email);
    if (!user) {
      throw new CustomError<IUserTranslation>("user.findUser.notFound", 404);
    }
    return {
      statusCode: 200,
      message: "user.findUser.found",
      data: user,
    };
  }
}
