import { AbstractRepository } from "@src/shared/classes/AbstractRepository";
import { CreateUserModel } from "../models/createUser.model";
import { User } from "@src/shared/entities/user.entity";

export class CreateUserRepository extends AbstractRepository<
  CreateUserModel,
  User
> {
  async execute(user: CreateUserModel): Promise<User> {
    const collection = this.db.collection("users");
    const newDocument = {
      name: user.username,
      email: user.email,
      password: user.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newDocument);

    return {
      id: result.insertedId.toString(),
      ...newDocument,
    };
  }
}
