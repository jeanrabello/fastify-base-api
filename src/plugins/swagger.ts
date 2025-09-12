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
      // Validar a procedência disso aqui
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
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

  console.log("Swagger enabled at http://localhost:3000/api/docs");
}

export { swaggerPlugin };
