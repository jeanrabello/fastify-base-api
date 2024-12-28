import dotenv from "dotenv";
import { Config, Environment } from "./types";

dotenv.config();
const environment = (process.env.NODE_ENV || "development") as Environment;

const getConfig = (): Config => {
  const config: Config = {
    app: {
      name: process.env.APP_NAME || "fastifyAPI",
      port: Number(process.env.APP_PORT) || 3000,
      env: environment,
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
  };

  return config;
};

const config = getConfig();

export default config;
