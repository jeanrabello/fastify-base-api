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
    const user = request.params;

    if (!user || !user.id) {
      throw new CustomError(request.languagePack.commom.error.requiredFields, 400);
    }

    const result = await this.findUserRepository.execute(user.id);

    return {
      statusCode: 200,
      data: result,
    };
  }
}
