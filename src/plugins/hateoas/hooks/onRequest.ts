import { FastifyRequest, FastifyReply } from "fastify";
import { FastifyHateoasOptions, LinkGeneratorContext } from "../types";

export function createOnRequestHook(options: FastifyHateoasOptions) {
  return async function onRequestHook(
    request: FastifyRequest,
    _reply: FastifyReply,
  ): Promise<void> {
    const baseUrl =
      typeof options.baseUrl === "function"
        ? options.baseUrl(request)
        : options.baseUrl;

    const context: LinkGeneratorContext = {
      request,
      baseUrl,
      routeUrl: request.url,
      params: (request.params as Record<string, string>) || {},
      query: (request.query as Record<string, string>) || {},
    };

    request.hateoasContext = context;
  };
}
