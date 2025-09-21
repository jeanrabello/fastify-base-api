import config from "@config/api";
import { fastifyCors } from "@fastify/cors";
import translationMiddleware from "@middlewares/translation";
import authMiddleware from "@middlewares/auth";
import { routes } from "@modules/routes";
import { rateLimitPlugin, swaggerPlugin } from "@plugins/index";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { initializeLoaders } from "./loaders/index";
import responseTranslator from "@middlewares/responseTranslator";
import errorHandler from "@middlewares/errorHandler";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
});

swaggerPlugin(app);
rateLimitPlugin(app);
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
    console.log(`Server listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    console.error("Failed to start application:", err);
    process.exit(1);
  }
};

startServer();

export default app;
