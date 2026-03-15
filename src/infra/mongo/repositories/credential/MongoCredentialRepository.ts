import {
  CreateCredentialInput,
  ICredentialRepository,
} from "@modules/auth/types/ICredentialRepository";
import { Credential } from "@src/shared/entities/credential.entity";
import { AbstractMongoRepository } from "../AbstractMongoRepository";

export class MongoCredentialRepository
  extends AbstractMongoRepository
  implements ICredentialRepository
{
  private collectionName = "credentials";

  async save(credential: CreateCredentialInput): Promise<Credential | null> {
    const newDocument = {
      userId: credential.userId,
      email: credential.email,
      secretData: credential.secretData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.db
      .collection(this.collectionName)
      .insertOne(newDocument);
    return {
      id: result.insertedId.toString(),
      userId: credential.userId,
      email: credential.email,
      secretData: credential.secretData,
      createdAt: newDocument.createdAt,
      updatedAt: newDocument.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<Credential | null> {
    const credential = await this.db
      .collection<Credential>(this.collectionName)
      .findOne({ email });
    if (!credential) return null;
    return {
      id: credential._id.toString(),
      userId: credential.userId,
      email: credential.email,
      secretData: credential.secretData,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  async updateEmail(userId: string, email: string): Promise<Credential | null> {
    const updated = await this.db
      .collection<Credential>(this.collectionName)
      .findOneAndUpdate(
        { userId },
        { $set: { email, updatedAt: new Date() } },
        { returnDocument: "after" },
      );
    if (!updated) return null;
    return {
      id: updated._id.toString(),
      userId: updated.userId,
      email: updated.email,
      secretData: updated.secretData,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.db
      .collection<Credential>(this.collectionName)
      .deleteOne({ userId });
    return result.deletedCount > 0;
  }
}
