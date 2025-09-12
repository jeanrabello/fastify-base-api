import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";

export default async function responseTranslator(app: FastifyInstance) {
  app.addHook(
    "onSend",
    (request: FastifyRequest, reply: FastifyReply, payload, done) => {
      let body: any = payload;
      try {
        if (typeof payload === "string") {
          try {
            body = JSON.parse(payload);
          } catch (parseErr) {
            return done(null, payload);
          }
        }
        if (body && typeof body === "object" && "message" in body) {
          const languagePack = request.languagePack;
          const message = getTranslationMessageFromPath(
            languagePack,
            body.message || null,
          );
          const newBody = {
            statusCode: reply.statusCode,
            message,
            data: body.data,
          };
          return done(null, JSON.stringify(newBody));
        }
      } catch (err) {
        // Log the error to aid debugging of response translation issues
        console.error("Error during response translation:", err);
      }
      done(null, payload);
    },
  );
}
