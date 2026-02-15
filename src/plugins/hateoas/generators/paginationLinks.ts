import {
  HateoasLink,
  LinkGeneratorContext,
  PaginationConfig,
  PaginationData,
} from "../types";
import { buildUrlWithQuery, mergeQueryParams } from "../utils/urlBuilder";

const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  enabled: true,
  pageParam: "page",
  sizeParam: "size",
  startPage: 1,
};

export function generatePaginationLinks(
  context: LinkGeneratorContext,
  paginationData: PaginationData,
  config?: Partial<PaginationConfig>,
  includeMethod: boolean = true,
): Record<string, HateoasLink> {
  const paginationConfig = { ...DEFAULT_PAGINATION_CONFIG, ...config };
  const { pageParam, sizeParam, startPage } = paginationConfig;

  const { page, size, totalItems } = paginationData;
  const totalPages =
    paginationData.totalPages || Math.ceil(totalItems / size) || 1;

  const links: Record<string, HateoasLink> = {};
  const basePath = context.routeUrl.split("?")[0];

  const createLink = (rel: string, pageNumber: number): HateoasLink => {
    const query = mergeQueryParams(context.query, {
      [pageParam]: pageNumber,
      [sizeParam]: size,
    });

    const link: HateoasLink = {
      rel,
      href: buildUrlWithQuery(context.baseUrl, basePath, query),
    };

    if (includeMethod) {
      link.method = "GET";
    }

    return link;
  };

  // First page link
  links.first = createLink("first", startPage);

  // Last page link
  const lastPage = startPage === 0 ? totalPages - 1 : totalPages;
  links.last = createLink("last", lastPage);

  // Previous page link (only if not on first page)
  const firstPageNumber = startPage;
  if (page > firstPageNumber) {
    links.prev = createLink("prev", page - 1);
  }

  // Next page link (only if not on last page)
  const lastPageNumber = startPage === 0 ? totalPages - 1 : totalPages;
  if (page < lastPageNumber) {
    links.next = createLink("next", page + 1);
  }

  return links;
}
