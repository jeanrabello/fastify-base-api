import { FastifyRequest } from "fastify";
import { LinkDefinition } from "./links";

export interface PaginationConfig {
  enabled: boolean;
  pageParam: string;
  sizeParam: string;
  startPage: 0 | 1;
}

export interface LinkGeneratorContext {
  request: FastifyRequest;
  baseUrl: string;
  routeUrl: string;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface RouteHateoasConfig {
  resource?: string;
  collection?: boolean;
  pagination?: boolean;
  links?: LinkDefinition[];
  itemLinks?: (item: any, context: LinkGeneratorContext) => LinkDefinition[];
  itemsPath?: string;
  disabled?: boolean;
}

export interface PaginationData {
  page: number;
  size: number;
  totalItems: number;
  totalPages?: number;
}

/**
 * Custom extractor functions for flexible response parsing
 */
export interface ExtractorsConfig {
  /**
   * Extract array of items from response body
   * Return null if items cannot be extracted
   */
  items?: (body: unknown) => unknown[] | null;

  /**
   * Extract pagination data from response body
   * Return null if pagination data cannot be extracted
   */
  pagination?: (body: unknown) => PaginationData | null;
}

/**
 * Path-based configuration for extracting data
 * Alternative to custom extractors for simpler cases
 */
export interface PathsConfig {
  /**
   * Path to items array (e.g., "data.content", "items", "results")
   */
  items?: string;

  /**
   * Path to total items count (e.g., "data.totalItems", "meta.total")
   */
  totalItems?: string;

  /**
   * Path to current page number (e.g., "data.page", "meta.page")
   */
  page?: string;

  /**
   * Path to page size (e.g., "data.size", "meta.perPage")
   */
  size?: string;
}

export interface FastifyHateoasOptions {
  /**
   * Base URL for generating links
   * Can be a string or function that receives the request
   */
  baseUrl: string | ((request: FastifyRequest) => string);

  /**
   * API prefix (for documentation purposes)
   */
  prefix?: string;

  /**
   * Pagination link configuration
   */
  pagination?: Partial<PaginationConfig>;

  /**
   * Include HTTP method in link objects
   * @default true
   */
  includeMethod?: boolean;

  /**
   * Routes to exclude from HATEOAS processing
   * Accepts string prefixes or RegExp patterns
   */
  exclude?: (string | RegExp)[];

  /**
   * Custom extractor functions for flexible response parsing
   * Takes priority over paths configuration
   */
  extractors?: ExtractorsConfig;

  /**
   * Path-based configuration for extracting data
   * Used when extractors are not provided
   * If not provided, auto-detection is used
   */
  paths?: PathsConfig;
}
