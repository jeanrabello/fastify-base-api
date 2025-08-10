import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getTranslationMessageFromPath } from "@utils/getTranslationMessageFromPath";

export default async function responseTranslator(app: FastifyInstance) {
  app.addHook(
    "onSend",
    (request: FastifyRequest, reply: FastifyReply, payload, done) => {
      try {
        const body =
          typeof payload === "string" ? JSON.parse(payload) : payload;
        if (body) {
          const message = getTranslationMessageFromPath(
            request.languagePack,
            body.message || null,
          );
          const newBody = {
            statusCode: reply.statusCode,
            message,
            data: body.data,
          };
          return done(null, JSON.stringify(newBody));
        }
      } catch {}
      done(null, payload);
    },
  );
}
