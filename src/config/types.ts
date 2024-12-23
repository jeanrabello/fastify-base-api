export type Environment = "development" | "production" | "test";

export interface Config {
  app: {
    name: string;
    port: number;
    env: Environment;
  };
  swagger: {
    enabled: boolean;
  };
  db: {
    uri: string;
    dbName: string;
  };
}
