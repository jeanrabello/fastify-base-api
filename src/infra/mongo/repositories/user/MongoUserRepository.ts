import { CreateUserRequestModel } from "@modules/user/models/Request/CreateUserRequest.model";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import { User } from "@src/shared/entities/user.entity";
import { ObjectId } from "mongodb";
import { AbstractMongoRepository } from "../AbstractMongoRepository";
import {
  PaginationParams,
  PaginatedResult,
} from "@src/shared/types/pagination";

export class MongoUserRepository
  extends AbstractMongoRepository
  implements IUserRepository
{
  private collectionName = "users";

  async save(newUser: CreateUserRequestModel): Promise<Partial<User> | null> {
    const newDocument = {
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.db
      .collection(this.collectionName)
      .insertOne(newDocument);
    return {
      id: result.insertedId.toString(),
      username: newUser.username,
      email: newUser.email,
    };
  }

  async findById(id: string): Promise<Partial<User> | null> {
    const user = await this.db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(id) });
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

  async findByEmail(email: string): Promise<Partial<User> | null> {
    const user = await this.db
      .collection<User>(this.collectionName)
      .findOne({ email });
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

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .collection<User>(this.collectionName)
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<Partial<User>>> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const size = params.size && params.size > 0 ? params.size : 10;
    const skip = (page - 1) * size;

    const collection = this.db.collection<User>(this.collectionName);
    const totalItems = await collection.countDocuments();
    const cursor = collection.find().skip(skip).limit(size);
    const docs = await cursor.toArray();

    const content: Partial<User>[] = docs.map((u) => ({
      id: u._id.toString(),
      username: u.username,
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    const totalPages = Math.ceil(totalItems / size);

    return {
      totalItems,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 && page <= totalPages ? page - 1 : null,
      page,
      size,
      content,
    };
  }

  async updateUserEmail(
    id: string,
    email: string,
  ): Promise<Partial<User> | null> {
    const updatedUser = await this.db
      .collection<User>(this.collectionName)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { email } },
        { returnDocument: "after" },
      );
    if (!updatedUser) return null;
    const result: Partial<User> = {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      email: updatedUser.email,
    };
    return result;
  }
}
