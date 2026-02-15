import { FastifyRequest, FastifyReply, RouteOptions } from "fastify";
import {
  RouteHateoasConfig,
  HateoasLink,
  LinkGeneratorContext,
  PaginationData,
} from "../types";
import { ResolvedHateoasOptions } from "../plugin";
import {
  generateSelfLink,
  generateLinks,
  generateItemLinks,
} from "../generators/linkGenerator";
import { generatePaginationLinks } from "../generators/paginationLinks";
import { Extractors } from "../utils/extractors";

export function createOnSendHook(options: ResolvedHateoasOptions) {
  return async function onSendHook(
    request: FastifyRequest,
    reply: FastifyReply,
    payload: unknown,
  ): Promise<unknown> {
    // Skip if not JSON response
    const contentType = reply.getHeader("content-type");
    if (
      typeof contentType === "string" &&
      !contentType.includes("application/json")
    ) {
      return payload;
    }

    // Skip excluded routes
    if (shouldExclude(request.url, options.exclude)) {
      return payload;
    }

    // Skip error responses
    if (reply.statusCode >= 400) {
      return payload;
    }

    try {
      let body: any = payload;

      if (typeof payload === "string") {
        try {
          body = JSON.parse(payload);
        } catch {
          return payload;
        }
      }

      if (!body || typeof body !== "object") {
        return payload;
      }

      // Get route-specific HATEOAS config
      const routeConfig = getRouteConfig(request);

      if (routeConfig?.disabled) {
        return payload;
      }

      const context = request.hateoasContext;
      if (!context) {
        return payload;
      }

      const includeMethod = options.includeMethod ?? true;

      // Generate links
      const links = await generateAllLinks(
        context,
        body,
        routeConfig,
        options,
        includeMethod,
      );

      // Add links to response
      if (Object.keys(links).length > 0) {
        body._links = links;
      }

      // Handle collection items
      if (routeConfig?.itemLinks) {
        body = addItemLinks(
          body,
          context,
          routeConfig,
          options.extractors,
          includeMethod,
        );
      }

      return JSON.stringify(body);
    } catch (error) {
      console.error("HATEOAS plugin error:", error);
      return payload;
    }
  };
}

function shouldExclude(url: string, patterns?: (string | RegExp)[]): boolean {
  if (!patterns || patterns.length === 0) {
    return false;
  }

  const path = url.split("?")[0];

  return patterns.some((pattern) => {
    if (typeof pattern === "string") {
      return path.startsWith(pattern);
    }
    return pattern.test(path);
  });
}

function getRouteConfig(request: FastifyRequest): RouteHateoasConfig | null {
  const routeOptions = request.routeOptions as RouteOptions & {
    config?: { hateoas?: RouteHateoasConfig };
  };

  return routeOptions?.config?.hateoas || null;
}

async function generateAllLinks(
  context: LinkGeneratorContext,
  body: any,
  routeConfig: RouteHateoasConfig | null,
  options: ResolvedHateoasOptions,
  includeMethod: boolean,
): Promise<Record<string, HateoasLink>> {
  const links: Record<string, HateoasLink> = {};

  // Self link
  links.self = generateSelfLink(
    context,
    context.request.method as any,
    includeMethod,
  );

  // Route-specific links
  if (routeConfig?.links && routeConfig.links.length > 0) {
    const routeLinks = generateLinks(routeConfig.links, context, includeMethod);
    Object.assign(links, routeLinks);
  }

  // Pagination links
  if (routeConfig?.pagination) {
    // Use extractor to get pagination data
    const paginationData = options.extractors.pagination(body);

    if (paginationData) {
      const pagLinks = generatePaginationLinks(
        context,
        paginationData,
        options.pagination,
        includeMethod,
      );
      Object.assign(links, pagLinks);
    }
  }

  return links;
}

function addItemLinks(
  body: any,
  context: LinkGeneratorContext,
  routeConfig: RouteHateoasConfig,
  extractors: Extractors,
  includeMethod: boolean,
): any {
  // Use route-specific itemsPath if provided, otherwise use extractor
  let items: unknown[] | null = null;

  if (routeConfig.itemsPath) {
    items = getNestedProperty(body, routeConfig.itemsPath);
    if (!Array.isArray(items)) {
      items = null;
    }
  } else {
    items = extractors.items(body);
  }

  if (!items || !Array.isArray(items)) {
    return body;
  }

  const itemsWithLinks = items.map((item) => {
    const itemLinks = generateItemLinks(
      item,
      routeConfig.itemLinks!,
      context,
      includeMethod,
    );

    return {
      ...(item as object),
      _links: itemLinks,
    };
  });

  // If route has itemsPath, set items back at that path
  if (routeConfig.itemsPath) {
    setNestedProperty(body, routeConfig.itemsPath, itemsWithLinks);
  } else {
    // Try to set items back at detected location
    setItemsInBody(body, itemsWithLinks);
  }

  return body;
}

function getNestedProperty(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

function setNestedProperty(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => current?.[key], obj);

  if (target && typeof target === "object") {
    target[lastKey] = value;
  }
}

/**
 * Try to set items back in the body at the most likely location
 */
function setItemsInBody(body: any, items: any[]): void {
  // Try common paths in priority order
  if (body.data?.content !== undefined && Array.isArray(body.data.content)) {
    body.data.content = items;
    return;
  }
  if (body.content !== undefined && Array.isArray(body.content)) {
    body.content = items;
    return;
  }
  if (body.data?.items !== undefined && Array.isArray(body.data.items)) {
    body.data.items = items;
    return;
  }
  if (body.data?.results !== undefined && Array.isArray(body.data.results)) {
    body.data.results = items;
    return;
  }
  if (Array.isArray(body.data)) {
    body.data = items;
    return;
  }
  if (body.items !== undefined && Array.isArray(body.items)) {
    body.items = items;
    return;
  }
  if (body.results !== undefined && Array.isArray(body.results)) {
    body.results = items;
    return;
  }
  if (body.records !== undefined && Array.isArray(body.records)) {
    body.records = items;
    return;
  }
}
