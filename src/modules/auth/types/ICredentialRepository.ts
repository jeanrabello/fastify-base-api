import { Credential } from "@src/shared/entities/credential.entity";

export interface CreateCredentialInput {
  userId: string;
  email: string;
  secretData: string;
}

export interface ICredentialRepository {
  save(credential: CreateCredentialInput): Promise<Credential | null>;
  findByEmail(email: string): Promise<Credential | null>;
  updateEmail(userId: string, email: string): Promise<Credential | null>;
  deleteByUserId(userId: string): Promise<boolean>;
}
