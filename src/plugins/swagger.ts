import config from "@config/api";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

/**
 * @param {FastifyInstance} app
 */
async function swaggerPlugin(app: FastifyInstance) {
  if (!config.swagger.enabled) {
    return;
  }

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Typed API",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });
}

export { swaggerPlugin };
