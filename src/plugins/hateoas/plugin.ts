import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { FastifyHateoasOptions } from "./types";
import { createOnRequestHook } from "./hooks/onRequest";
import { createOnSendHook } from "./hooks/onSend";
import { createExtractors, Extractors } from "./utils/extractors";

export interface ResolvedHateoasOptions extends FastifyHateoasOptions {
  extractors: Extractors;
}

async function hateoasPlugin(
  fastify: FastifyInstance,
  options: FastifyHateoasOptions,
): Promise<void> {
  // Validate required options
  if (!options.baseUrl) {
    throw new Error("fastify-hateoas: baseUrl option is required");
  }

  // Create extractors from configuration
  const extractors = createExtractors(options.extractors, options.paths);

  // Set default options
  const pluginOptions: ResolvedHateoasOptions = {
    ...options,
    prefix: options.prefix ?? "",
    includeMethod: options.includeMethod ?? true,
    pagination: {
      enabled: true,
      pageParam: "page",
      sizeParam: "size",
      startPage: 1,
      ...options.pagination,
    },
    extractors,
  };

  // Register onRequest hook to create HATEOAS context
  fastify.addHook("onRequest", createOnRequestHook(pluginOptions));

  // Register onSend hook to add HATEOAS links
  fastify.addHook("onSend", createOnSendHook(pluginOptions));
}

export default fp(hateoasPlugin, {
  name: "fastify-hateoas",
  fastify: "5.x",
});
