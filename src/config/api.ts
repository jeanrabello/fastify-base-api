import dotenv from "dotenv";
import { Config, Environment } from "./types";

const environment = (process.env.NODE_ENV || "development") as Environment;

dotenv.config({
  path: `.env.${environment}`,
});

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
  };

  return config;
};

const config = getConfig();

export default config;
