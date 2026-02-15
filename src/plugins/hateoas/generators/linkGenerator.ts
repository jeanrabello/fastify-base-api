import {
  HateoasLink,
  LinkDefinition,
  LinkGeneratorContext,
  HttpMethod,
} from "../types";
import { buildUrl } from "../utils/urlBuilder";

export function generateLink(
  definition: LinkDefinition,
  context: LinkGeneratorContext,
  includeMethod: boolean = true,
): HateoasLink {
  let href: string;

  if (definition.href) {
    href = definition.href;
  } else if (definition.path) {
    href = buildUrl(context.baseUrl, definition.path, context.params);
  } else {
    href = buildUrl(context.baseUrl, context.routeUrl, context.params);
  }

  const link: HateoasLink = {
    rel: definition.rel,
    href,
  };

  if (includeMethod && definition.method) {
    link.method = definition.method;
  }

  if (definition.title) {
    link.title = definition.title;
  }

  return link;
}

export function generateSelfLink(
  context: LinkGeneratorContext,
  method: HttpMethod = "GET",
  includeMethod: boolean = true,
): HateoasLink {
  // Extract path without query string
  const routePath = context.routeUrl.split("?")[0];

  const queryString = Object.keys(context.query).length
    ? `?${new URLSearchParams(context.query).toString()}`
    : "";

  const link: HateoasLink = {
    rel: "self",
    href: `${buildUrl(context.baseUrl, routePath, context.params)}${queryString}`,
  };

  if (includeMethod) {
    link.method = method;
  }

  return link;
}

export function generateLinks(
  definitions: LinkDefinition[],
  context: LinkGeneratorContext,
  includeMethod: boolean = true,
): Record<string, HateoasLink> {
  const links: Record<string, HateoasLink> = {};

  for (const definition of definitions) {
    links[definition.rel] = generateLink(definition, context, includeMethod);
  }

  return links;
}

export function generateItemLinks(
  item: any,
  itemLinksGenerator: (
    item: any,
    context: LinkGeneratorContext,
  ) => LinkDefinition[],
  context: LinkGeneratorContext,
  includeMethod: boolean = true,
): Record<string, HateoasLink> {
  const definitions = itemLinksGenerator(item, context);
  return generateLinks(definitions, context, includeMethod);
}
