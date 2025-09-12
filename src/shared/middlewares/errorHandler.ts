import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import CustomError from "../classes/CustomError";

export default async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request: FastifyRequest, reply: FastifyReply) => {
    if (Array.isArray((error as any).validation)) {
      const issues = (error as any).validation as Array<{
        instancePath: string;
        message: string;
      }>;
      const campos = issues.map((i) => i.instancePath.replace(/^\//, ""));
      const fields = campos.length ? `'${campos.join("', '")}'` : "";
      return reply
        .status(400)
        .type("application/json")
        .send(
          JSON.stringify({ message: `shared.error.invalidFields: ${fields}` }),
        );
    }

    if (error instanceof CustomError) {
      return reply
        .status(error.statusCode)
        .type("application/json")
        .send(JSON.stringify({ message: error.message }));
    }

    // Rate limit error handling
    if (error.statusCode === 429) {
      return reply
        .status(429)
        .type("application/json")
        .send(JSON.stringify({ message: "shared.error.tooManyRequests" }));
    }

    return reply
      .status(500)
      .type("application/json")
      .send(JSON.stringify({ message: "shared.error.internalServerError" }));
  });
}
