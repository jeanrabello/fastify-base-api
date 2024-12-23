import config from "@config/api";
import { fastifyCors } from "@fastify/cors";
import translationMiddleware from "@middlewares/translation";
import { routes } from "@modules/routes";
import { swaggerPlugin } from "@plugins/index";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { connectToDatabase } from "./src/loaders/database";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
});

swaggerPlugin(app);
translationMiddleware(app);
app.register(routes);
connectToDatabase();

app.listen({ port: config.app.port }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

export default app;
