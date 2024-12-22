import "fastify";
import { Translation } from "./lang";

declare module "fastify" {
  interface FastifyRequest {
    languagePack: Translation;
  }
}
