import { AbstractRepository } from "@src/shared/classes/AbstractRepository";
import { User } from "@src/shared/entities/user.entity";
import { ObjectId } from "mongodb";

export class FindUserRepository extends AbstractRepository<
  string,
  User | null
> {
  async execute(id: string): Promise<User | null> {
    const collection = this.db.collection<User>("users");

    const result = await collection.findOne({ _id: new ObjectId(id) });

    return result;
  }
}
