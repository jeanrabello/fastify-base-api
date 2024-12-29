import { Controller } from "@src/types/controller";
import { HttpRequest, HttpResponse } from "@src/types/http";
import { FindUserRepository } from "../repositories/FindUserRepository";

export class FindUserController implements Controller<null> {
  constructor(private findUserRepository: FindUserRepository) {}

  async handle(request: HttpRequest<null>): Promise<HttpResponse> {
    const user = request.params;

    if (!user || !user.id) {
      throw new Error(request.languagePack.commom.error.requiredFields);
    }

    const result = await this.findUserRepository.execute(user.id);

    if (!result) {
      throw new Error(request.languagePack.user.findUser.notFound);
    }

    return {
      statusCode: 302,
      data: result,
    };
  }
}
