import "fastify";
import { Translation } from "./lang";

// Interface para o usuário autenticado
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

declare module "fastify" {
  interface FastifyRequest {
    languagePack: Translation;
    lang: string;
    user?: AuthenticatedUser;
  }
}
