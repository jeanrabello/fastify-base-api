import { Controller } from "@src/types/controller";
import { HttpRequest, HttpResponse } from "@src/types/http";
import { FindUserRepository } from "../repositories/FindUserRepository";
import CustomError from "@src/shared/classes/CustomError";

export class FindUserController implements Controller<null> {
  private findUserRepository: FindUserRepository;

  constructor(repository: FindUserRepository) {
    this.findUserRepository = repository;
  }

  async handle(request: HttpRequest<null>): Promise<HttpResponse> {
    const userRequest = request.params;

    if (!userRequest || !userRequest.id) {
      throw new CustomError(
        request.languagePack.commom.error.requiredFields,
        400,
      );
    }

    const user = await this.findUserRepository.execute(userRequest.id);

    if(!user) {
      throw new CustomError(request.languagePack.user.findUser.notFound, 400);
    }

    return {
      statusCode: 200,
      data: user,
    };
  }
}
