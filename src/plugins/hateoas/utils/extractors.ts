import { PaginationData } from "../types";

export type ItemsExtractor = (body: unknown) => unknown[] | null;
export type PaginationExtractor = (body: unknown) => PaginationData | null;

export interface Extractors {
  items: ItemsExtractor;
  pagination: PaginationExtractor;
}

export interface PathsConfig {
  items?: string;
  totalItems?: string;
  page?: string;
  size?: string;
}

/**
 * Get nested property from object using dot notation
 */
function getNestedProperty(obj: object, path: string): unknown {
  return path.split(".").reduce((current: any, key) => current?.[key], obj);
}

/**
 * Default items extractor with auto-detection
 * Tries common patterns in order of priority
 */
export function defaultItemsExtractor(body: unknown): unknown[] | null {
  if (!body) return null;

  // Direct array
  if (Array.isArray(body)) return body;

  if (typeof body !== "object") return null;

  const obj = body as Record<string, unknown>;

  // Common nested patterns (in priority order)
  const patterns = [
    "data.content", // Current API format
    "content", // Spring Boot
    "data.items",
    "data.results",
    "data", // If data is array
    "items", // Common
    "results", // Django REST
    "records", // Various
    "rows", // SQL-style
  ];

  for (const pattern of patterns) {
    const value = getNestedProperty(obj, pattern);
    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
}

/**
 * Default pagination extractor with auto-detection
 * Tries common patterns for pagination metadata
 */
export function defaultPaginationExtractor(
  body: unknown,
): PaginationData | null {
  if (!body || typeof body !== "object") return null;

  const obj = body as Record<string, unknown>;

  // Try different pagination structures

  // Pattern 1: Current API format (nested in data)
  const data = obj.data as Record<string, unknown> | undefined;
  if (data && typeof data === "object") {
    if (
      typeof data.page === "number" &&
      typeof data.size === "number" &&
      typeof data.totalItems === "number"
    ) {
      return {
        page: data.page,
        size: data.size,
        totalItems: data.totalItems,
        totalPages:
          typeof data.totalPages === "number" ? data.totalPages : undefined,
      };
    }
  }

  // Pattern 2: Spring Boot style (root level)
  if (
    typeof obj.number === "number" &&
    typeof obj.size === "number" &&
    typeof obj.totalElements === "number"
  ) {
    return {
      page: obj.number,
      size: obj.size,
      totalItems: obj.totalElements,
      totalPages:
        typeof obj.totalPages === "number" ? obj.totalPages : undefined,
    };
  }

  // Pattern 3: Root level common format
  if (
    typeof obj.page === "number" &&
    typeof obj.size === "number" &&
    typeof obj.totalItems === "number"
  ) {
    return {
      page: obj.page,
      size: obj.size,
      totalItems: obj.totalItems,
      totalPages:
        typeof obj.totalPages === "number" ? obj.totalPages : undefined,
    };
  }

  // Pattern 4: page + limit + total
  if (
    typeof obj.page === "number" &&
    typeof obj.limit === "number" &&
    typeof obj.total === "number"
  ) {
    return {
      page: obj.page,
      size: obj.limit,
      totalItems: obj.total,
    };
  }

  // Pattern 5: page + per_page + total_count (GitHub style)
  if (
    typeof obj.page === "number" &&
    typeof obj.per_page === "number" &&
    typeof obj.total_count === "number"
  ) {
    return {
      page: obj.page,
      size: obj.per_page,
      totalItems: obj.total_count,
    };
  }

  // Pattern 6: Meta object
  const meta = obj.meta as Record<string, unknown> | undefined;
  if (meta && typeof meta === "object") {
    const page = meta.page ?? meta.currentPage ?? meta.current_page;
    const size = meta.size ?? meta.perPage ?? meta.per_page ?? meta.limit;
    const totalItems =
      meta.totalItems ?? meta.total ?? meta.totalCount ?? meta.total_count;

    if (
      typeof page === "number" &&
      typeof size === "number" &&
      typeof totalItems === "number"
    ) {
      return {
        page,
        size,
        totalItems,
        totalPages:
          typeof meta.totalPages === "number"
            ? meta.totalPages
            : typeof meta.total_pages === "number"
              ? meta.total_pages
              : undefined,
      };
    }
  }

  // Pattern 7: Pagination object
  const pagination = obj.pagination as Record<string, unknown> | undefined;
  if (pagination && typeof pagination === "object") {
    const page =
      pagination.page ?? pagination.currentPage ?? pagination.current_page;
    const size =
      pagination.size ??
      pagination.perPage ??
      pagination.per_page ??
      pagination.limit;
    const totalItems =
      pagination.totalItems ??
      pagination.total ??
      pagination.totalCount ??
      pagination.total_count;

    if (
      typeof page === "number" &&
      typeof size === "number" &&
      typeof totalItems === "number"
    ) {
      return {
        page,
        size,
        totalItems,
        totalPages:
          typeof pagination.totalPages === "number"
            ? pagination.totalPages
            : typeof pagination.total_pages === "number"
              ? pagination.total_pages
              : undefined,
      };
    }
  }

  return null;
}

/**
 * Create items extractor from path string
 */
export function createItemsExtractorFromPath(path: string): ItemsExtractor {
  return (body: unknown) => {
    const value = getNestedProperty(body, path);
    return Array.isArray(value) ? value : null;
  };
}

/**
 * Create pagination extractor from paths config
 */
export function createPaginationExtractorFromPaths(
  paths: PathsConfig,
): PaginationExtractor {
  return (body: unknown) => {
    const page = paths.page ? getNestedProperty(body, paths.page) : undefined;
    const size = paths.size ? getNestedProperty(body, paths.size) : undefined;
    const totalItems = paths.totalItems
      ? getNestedProperty(body, paths.totalItems)
      : undefined;

    if (
      typeof page !== "number" ||
      typeof size !== "number" ||
      typeof totalItems !== "number"
    ) {
      return null;
    }

    return { page, size, totalItems };
  };
}

/**
 * Create extractors from configuration
 */
export function createExtractors(
  customExtractors?: {
    items?: ItemsExtractor;
    pagination?: PaginationExtractor;
  },
  paths?: PathsConfig,
): Extractors {
  let itemsExtractor: ItemsExtractor = defaultItemsExtractor;
  let paginationExtractor: PaginationExtractor = defaultPaginationExtractor;

  // Custom extractors take priority
  if (customExtractors?.items) {
    itemsExtractor = customExtractors.items;
  } else if (paths?.items) {
    itemsExtractor = createItemsExtractorFromPath(paths.items);
  }

  if (customExtractors?.pagination) {
    paginationExtractor = customExtractors.pagination;
  } else if (paths?.totalItems && paths?.page && paths?.size) {
    paginationExtractor = createPaginationExtractorFromPaths(paths);
  }

  return {
    items: itemsExtractor,
    pagination: paginationExtractor,
  };
}
