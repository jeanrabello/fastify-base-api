import config from "@config/api";
import { fastifyCors } from "@fastify/cors";
import translationMiddleware from "@middlewares/translation";
import authMiddleware from "@middlewares/auth";
import { routes } from "@modules/routes";
import { swaggerPlugin } from "@plugins/index";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { initializeLoaders } from "./loaders/index";
import responseTranslator from "@middlewares/responseTranslator";
import errorHandler from "@middlewares/errorHandler";
import { createMetricsMiddleware } from "./observability/metrics";
import logger from "./observability/logger";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
});

swaggerPlugin(app);
createMetricsMiddleware(app);
translationMiddleware(app);
authMiddleware(app);
responseTranslator(app);
errorHandler(app);

app.register(routes, { prefix: "/api" });

const startServer = async () => {
  try {
    await initializeLoaders();

    const appConfig = { port: config.app.port, host: config.app.host };
    const address = await app.listen(appConfig);
    logger.info({ address, port: config.app.port, host: config.app.host }, "Server listening");
  } catch (err) {
    logger.error({ err }, "Failed to start application");
    process.exit(1);
  }
};

startServer();

export default app;
