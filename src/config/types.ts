export type Environment = "development" | "production" | "test";

export interface Config {
  app: {
    name: string;
    port: number;
    env: Environment;
    host: string;
    url: string;
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
  nodemailer: {
    user: string;
    pass: string;
    service: string;
  };
  security: {
    bcryptSaltRounds: number;
  };
  jwt: {
    tokenSecret: string;
    tokenExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
  };
  rateLimit: {
    enabled: boolean;
    max: number;
    timeWindow: number;
    disableLimitSecret: string;
  };
}
