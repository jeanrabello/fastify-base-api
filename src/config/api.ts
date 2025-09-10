import { Config, Environment } from "./types";

const environment = (process.env.NODE_ENV || "development") as Environment;

const getConfig = (): Config => {
  const config: Config = {
    app: {
      name: process.env.APP_NAME || "FastifyAPI",
      port: Number(process.env.APP_PORT) || 3000,
      env: environment,
      host: process.env.APP_HOST || "127.0.0.1",
      url: process.env.BASE_URL || "http://127.0.0.1:3000",
    },
    swagger: {
      enabled: environment === "development",
    },
    db: {
      uri: process.env.MONGO_URI || "",
      dbName: process.env.MONGO_DB_NAME || "fastifyAPI",
      user: process.env.MONGO_INITDB_ROOT_USERNAME || "root",
      password: process.env.MONGO_INITDB_ROOT_PASSWORD || "root",
    },
    nodemailer: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
      service: process.env.EMAIL_SERVICE || "gmail",
    },
    security: {
      bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
    },
    jwt: {
      tokenSecret: process.env.JWT_SECRET || "default-token-secret",
      tokenExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
      refreshTokenSecret:
        process.env.JWT_REFRESH_SECRET || "default-refresh-token-secret",
      refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
  };

  return config;
};

const config = getConfig();

export default config;
