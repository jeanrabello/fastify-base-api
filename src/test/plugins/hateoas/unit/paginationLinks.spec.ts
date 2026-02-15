import {
  generatePaginationLinks,
  defaultPaginationExtractor,
  createPaginationExtractorFromPaths,
} from "@plugins/hateoas";
import type { LinkGeneratorContext, PaginationData } from "@plugins/hateoas";
import { FastifyRequest } from "fastify";

describe("paginationLinks", () => {
  const mockContext: LinkGeneratorContext = {
    request: { method: "GET" } as FastifyRequest,
    baseUrl: "https://api.example.com",
    routeUrl: "/api/user",
    params: {},
    query: {},
  };

  describe("generatePaginationLinks", () => {
    it("should generate all pagination links for middle page", () => {
      const paginationData: PaginationData = {
        page: 5,
        size: 10,
        totalItems: 100,
      };

      const links = generatePaginationLinks(mockContext, paginationData);

      expect(links.first).toBeDefined();
      expect(links.first.href).toContain("page=1");
      expect(links.prev).toBeDefined();
      expect(links.prev!.href).toContain("page=4");
      expect(links.next).toBeDefined();
      expect(links.next!.href).toContain("page=6");
      expect(links.last).toBeDefined();
      expect(links.last.href).toContain("page=10");
    });

    it("should not generate prev link for first page", () => {
      const paginationData: PaginationData = {
        page: 1,
        size: 10,
        totalItems: 100,
      };

      const links = generatePaginationLinks(mockContext, paginationData);

      expect(links.prev).toBeUndefined();
      expect(links.next).toBeDefined();
      expect(links.first).toBeDefined();
      expect(links.last).toBeDefined();
    });

    it("should not generate next link for last page", () => {
      const paginationData: PaginationData = {
        page: 10,
        size: 10,
        totalItems: 100,
      };

      const links = generatePaginationLinks(mockContext, paginationData);

      expect(links.next).toBeUndefined();
      expect(links.prev).toBeDefined();
    });

    it("should preserve existing query params", () => {
      const contextWithQuery: LinkGeneratorContext = {
        ...mockContext,
        query: { filter: "active" },
      };

      const paginationData: PaginationData = {
        page: 2,
        size: 10,
        totalItems: 50,
      };

      const links = generatePaginationLinks(contextWithQuery, paginationData);

      expect(links.next!.href).toContain("filter=active");
      expect(links.next!.href).toContain("page=3");
    });

    it("should include method when includeMethod is true", () => {
      const paginationData: PaginationData = {
        page: 1,
        size: 10,
        totalItems: 50,
      };

      const links = generatePaginationLinks(
        mockContext,
        paginationData,
        undefined,
        true,
      );

      expect(links.first.method).toBe("GET");
      expect(links.next!.method).toBe("GET");
    });

    it("should not include method when includeMethod is false", () => {
      const paginationData: PaginationData = {
        page: 1,
        size: 10,
        totalItems: 50,
      };

      const links = generatePaginationLinks(
        mockContext,
        paginationData,
        undefined,
        false,
      );

      expect(links.first.method).toBeUndefined();
    });

    it("should use custom pagination params", () => {
      const paginationData: PaginationData = {
        page: 2,
        size: 20,
        totalItems: 100,
      };

      const config = {
        pageParam: "p",
        sizeParam: "limit",
      };

      const links = generatePaginationLinks(
        mockContext,
        paginationData,
        config,
      );

      expect(links.next!.href).toContain("p=3");
      expect(links.next!.href).toContain("limit=20");
    });

    it("should use totalPages from paginationData when provided", () => {
      const paginationData: PaginationData = {
        page: 2,
        size: 10,
        totalItems: 50,
        totalPages: 5,
      };

      const links = generatePaginationLinks(mockContext, paginationData);

      expect(links.last.href).toContain("page=5");
    });

    it("should handle zero-based startPage", () => {
      const paginationData: PaginationData = {
        page: 0,
        size: 10,
        totalItems: 50,
      };

      const config = { startPage: 0 as const };

      const links = generatePaginationLinks(
        mockContext,
        paginationData,
        config,
      );

      expect(links.first.href).toContain("page=0");
      expect(links.last.href).toContain("page=4");
      expect(links.prev).toBeUndefined();
      expect(links.next).toBeDefined();
    });

    it("should not generate next link on last page with zero-based startPage", () => {
      const paginationData: PaginationData = {
        page: 4,
        size: 10,
        totalItems: 50,
      };

      const config = { startPage: 0 as const };

      const links = generatePaginationLinks(
        mockContext,
        paginationData,
        config,
      );

      expect(links.next).toBeUndefined();
      expect(links.prev).toBeDefined();
    });

    it("should default totalPages to 1 when totalItems is 0", () => {
      const paginationData: PaginationData = {
        page: 1,
        size: 10,
        totalItems: 0,
      };

      const links = generatePaginationLinks(mockContext, paginationData);

      expect(links.first).toBeDefined();
      expect(links.last).toBeDefined();
      expect(links.last.href).toContain("page=1");
    });

    it("should handle single page of results", () => {
      const paginationData: PaginationData = {
        page: 1,
        size: 10,
        totalItems: 5,
      };

      const links = generatePaginationLinks(mockContext, paginationData);

      expect(links.prev).toBeUndefined();
      expect(links.next).toBeUndefined();
      expect(links.first).toBeDefined();
      expect(links.last).toBeDefined();
    });
  });

  describe("defaultPaginationExtractor", () => {
    it("should extract pagination data from nested data object", () => {
      const body = {
        statusCode: 200,
        data: {
          page: 1,
          size: 10,
          totalItems: 100,
          content: [],
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 1,
        size: 10,
        totalItems: 100,
        totalPages: undefined,
      });
    });

    it("should extract pagination from root level", () => {
      const body = {
        page: 2,
        size: 15,
        totalItems: 45,
        items: [],
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 2,
        size: 15,
        totalItems: 45,
        totalPages: undefined,
      });
    });

    it("should extract Spring Boot style pagination", () => {
      const body = {
        content: [],
        number: 3,
        size: 20,
        totalElements: 100,
        totalPages: 5,
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 3,
        size: 20,
        totalItems: 100,
        totalPages: 5,
      });
    });

    it("should extract Spring Boot style without totalPages", () => {
      const body = {
        content: [],
        number: 1,
        size: 10,
        totalElements: 30,
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 1,
        size: 10,
        totalItems: 30,
        totalPages: undefined,
      });
    });

    it("should extract root level format with totalPages", () => {
      const body = {
        page: 2,
        size: 10,
        totalItems: 100,
        totalPages: 10,
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 2,
        size: 10,
        totalItems: 100,
        totalPages: 10,
      });
    });

    it("should extract root level format without totalPages", () => {
      const body = {
        page: 1,
        size: 10,
        totalItems: 50,
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 1,
        size: 10,
        totalItems: 50,
        totalPages: undefined,
      });
    });

    it("should extract from meta object with totalPages from meta.totalPages", () => {
      const body = {
        data: [],
        meta: {
          page: 1,
          size: 10,
          total: 50,
          totalPages: 5,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 1,
        size: 10,
        totalItems: 50,
        totalPages: 5,
      });
    });

    it("should extract from pagination object with standard field names", () => {
      const body = {
        data: [],
        pagination: {
          page: 2,
          size: 10,
          totalItems: 100,
          totalPages: 10,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 2,
        size: 10,
        totalItems: 100,
        totalPages: 10,
      });
    });

    it("should extract from pagination object without totalPages", () => {
      const body = {
        data: [],
        pagination: {
          page: 1,
          size: 10,
          total: 50,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 1,
        size: 10,
        totalItems: 50,
        totalPages: undefined,
      });
    });

    it("should extract from meta object", () => {
      const body = {
        data: [],
        meta: {
          page: 1,
          perPage: 10,
          total: 50,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 1,
        size: 10,
        totalItems: 50,
        totalPages: undefined,
      });
    });

    it("should return null for null body", () => {
      expect(defaultPaginationExtractor(null)).toBeNull();
    });

    it("should return null for non-object body", () => {
      expect(defaultPaginationExtractor("string")).toBeNull();
    });

    it("should extract page + limit + total format", () => {
      const body = {
        page: 1,
        limit: 20,
        total: 100,
        data: [],
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 1,
        size: 20,
        totalItems: 100,
      });
    });

    it("should extract GitHub style (page + per_page + total_count)", () => {
      const body = {
        page: 2,
        per_page: 30,
        total_count: 150,
        items: [],
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 2,
        size: 30,
        totalItems: 150,
      });
    });

    it("should extract from pagination object", () => {
      const body = {
        data: [],
        pagination: {
          currentPage: 3,
          perPage: 25,
          total: 200,
          totalPages: 8,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 3,
        size: 25,
        totalItems: 200,
        totalPages: 8,
      });
    });

    it("should extract from pagination object with total_pages", () => {
      const body = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 50,
          total_pages: 5,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 1,
        size: 10,
        totalItems: 50,
        totalPages: 5,
      });
    });

    it("should return null from pagination object with missing fields", () => {
      const body = {
        pagination: {
          offset: 10,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toBeNull();
    });

    it("should extract from meta object with total_pages", () => {
      const body = {
        data: [],
        meta: {
          current_page: 2,
          per_page: 15,
          total_count: 75,
          total_pages: 5,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toEqual({
        page: 2,
        size: 15,
        totalItems: 75,
        totalPages: 5,
      });
    });

    it("should return null from meta object with missing fields", () => {
      const body = {
        meta: {
          offset: 0,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toBeNull();
    });

    it("should return null if pagination fields are missing", () => {
      const body = {
        statusCode: 200,
        data: {
          items: [],
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result).toBeNull();
    });

    it("should include totalPages if provided", () => {
      const body = {
        data: {
          page: 1,
          size: 10,
          totalItems: 100,
          totalPages: 10,
        },
      };

      const result = defaultPaginationExtractor(body);

      expect(result?.totalPages).toBe(10);
    });
  });

  describe("createPaginationExtractorFromPaths", () => {
    it("should extract pagination from custom paths", () => {
      const body = {
        response: {
          pagination: {
            currentPage: 2,
            itemsPerPage: 15,
            totalRecords: 45,
          },
        },
      };

      const extractor = createPaginationExtractorFromPaths({
        page: "response.pagination.currentPage",
        size: "response.pagination.itemsPerPage",
        totalItems: "response.pagination.totalRecords",
      });

      const result = extractor(body);

      expect(result).toEqual({
        page: 2,
        size: 15,
        totalItems: 45,
      });
    });

    it("should return null when only page path is configured", () => {
      const extractor = createPaginationExtractorFromPaths({
        page: "meta.page",
      });

      const result = extractor({ meta: { page: 1, size: 10, total: 50 } });

      expect(result).toBeNull();
    });

    it("should return null when page path is missing", () => {
      const extractor = createPaginationExtractorFromPaths({
        size: "meta.size",
        totalItems: "meta.total",
      });

      const result = extractor({ meta: { page: 1, size: 10, total: 50 } });

      expect(result).toBeNull();
    });

    it("should return null if paths don't exist", () => {
      const body = {
        data: {},
      };

      const extractor = createPaginationExtractorFromPaths({
        page: "meta.page",
        size: "meta.size",
        totalItems: "meta.total",
      });

      const result = extractor(body);

      expect(result).toBeNull();
    });
  });
});
