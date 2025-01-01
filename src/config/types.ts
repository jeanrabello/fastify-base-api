export type Environment = "development" | "production" | "test";

export interface Config {
  app: {
    name: string;
    port: number;
    env: Environment;
    host: string;
  };
  swagger: {
    enabled: boolean;
  };
  db: {
    uri: string;
    dbName: string;
    user: string;
    password: string;
  };
}
