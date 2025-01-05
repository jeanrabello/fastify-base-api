import { Controller } from "@src/types/controller";
import { HttpRequest, HttpResponse } from "@src/types/http";
import { CreateUserModel } from "../models/createUser.model";
import { CreateUserRepository } from "../repositories/CreateUserRepository";
import { FindUserByEmailRepository } from "../repositories/FindUserByEmailRepository";
import CustomError from "@src/shared/classes/CustomError";

interface ICreateUserController {
  createUserRepository: CreateUserRepository;
  findUserByEmailRepository: FindUserByEmailRepository;
}

export class CreateUserController implements Controller<CreateUserModel> {
  private createUserRepository: CreateUserRepository;
  private findUserByEmailRepository: FindUserByEmailRepository;

  constructor(repositories: ICreateUserController) {
    this.createUserRepository = repositories.createUserRepository;
    this.findUserByEmailRepository = repositories.findUserByEmailRepository;
  }

  async handle(request: HttpRequest<CreateUserModel>): Promise<HttpResponse> {
    const newUser = request.body;

    if (!newUser) {
      throw new CustomError(request.languagePack.commom.error.requiredFields, 400);
    }

    const user = await this.findUserByEmailRepository.execute(newUser.email);

    if (user) {
      throw new CustomError(request.languagePack.user.createUser.emailAlreadyRegistered, 409);
    }

    const result = await this.createUserRepository.execute(newUser);

    if (!result) {
      throw new CustomError(request.languagePack.user.createUser.error, 500);
    }

    return {
      statusCode: 201,
      message: request.languagePack.user.createUser.success,
      data: result,
    };
  }
}
