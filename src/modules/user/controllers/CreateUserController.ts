import { Controller } from "@src/types/controller";
import { HttpRequest, HttpResponse } from "@src/types/http";
import { CreateUserModel } from "../models/createUser.model";
import { CreateUserRepository } from "../repositories/CreateUserRepository";

export class CreateUserController implements Controller<CreateUserModel> {
  private createUserRepository: CreateUserRepository;

  constructor(repository: CreateUserRepository) {
    this.createUserRepository = repository;
  }

  async handle(request: HttpRequest<CreateUserModel>): Promise<HttpResponse> {
    const newUser = request.body;

    if (!newUser) {
      throw new Error(request.languagePack.commom.error.requiredFields);
    }

    const result = await this.createUserRepository.execute(newUser);

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
