import { AbstractRepository } from "@src/shared/classes/AbstractRepository";
import { User } from "@src/shared/entities/user.entity";

export class FindUserByEmailRepository extends AbstractRepository<
  string,
  Partial<User> | null
> {
  async execute(email: string): Promise<Partial<User> | null> {
    const collection = this.db.collection<User>("users");

    const user = await collection.findOne({ email });

    if (!user) return null;

    const result: Partial<User> = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return result;
  }
}
