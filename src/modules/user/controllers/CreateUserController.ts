import { Controller } from "@src/types/controller";
import { HttpRequest, HttpResponse } from "@src/types/http";
import { CreateUserModel } from "../models/createUser.model";
import { CreateUserRepository } from "../repositories/CreateUserRepository";

export class CreateUserController implements Controller<CreateUserModel> {
  async handle(request: HttpRequest<CreateUserModel>): Promise<HttpResponse> {
    const newUser = request.body;

    if (!newUser) {
      throw new Error(request.languagePack.commom.error.requiredFields);
    }
    const repo = new CreateUserRepository();

    const result = await repo.execute(newUser);

    if (!result) {
      throw new Error(request.languagePack.user.createUser.error);
    }

    return {
      statusCode: 201,
      message: request.languagePack.user.createUser.success,
      data: result,
    };
  }
}
