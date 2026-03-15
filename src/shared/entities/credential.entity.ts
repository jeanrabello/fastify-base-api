export interface Credential {
  id?: string;
  userId: string;
  email: string;
  secretData: string;
  createdAt?: Date;
  updatedAt?: Date;
}
