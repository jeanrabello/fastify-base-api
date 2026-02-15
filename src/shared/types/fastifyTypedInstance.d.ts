import {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyReply,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  LinkGeneratorContext,
  RouteHateoasConfig,
} from "@plugins/hateoas/types";

declare module "fastify" {
  interface FastifyRequest {
    hateoasContext: LinkGeneratorContext;
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
    optionalAuthenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }

  interface FastifyContextConfig {
    hateoas?: RouteHateoasConfig;
  }
}

export type FastifyTypedInstance = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  FastifyBaseLogger,
  ZodTypeProvider
>;
