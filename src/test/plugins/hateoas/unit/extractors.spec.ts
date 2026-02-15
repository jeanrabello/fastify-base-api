import {
  defaultItemsExtractor,
  defaultPaginationExtractor,
  createItemsExtractorFromPath,
  createExtractors,
} from "@plugins/hateoas";

describe("extractors", () => {
  describe("defaultItemsExtractor", () => {
    it("should extract items from data.content", () => {
      const body = {
        data: {
          content: [{ id: 1 }, { id: 2 }],
        },
      };

      const result = defaultItemsExtractor(body);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should extract items from content (Spring Boot)", () => {
      const body = {
        content: [{ id: 1 }, { id: 2 }],
        totalElements: 100,
      };

      const result = defaultItemsExtractor(body);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should extract items from data when it's an array", () => {
      const body = {
        data: [{ id: 1 }, { id: 2 }],
      };

      const result = defaultItemsExtractor(body);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should extract items from items property", () => {
      const body = {
        items: [{ id: 1 }, { id: 2 }],
      };

      const result = defaultItemsExtractor(body);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should extract items from results (Django REST)", () => {
      const body = {
        results: [{ id: 1 }, { id: 2 }],
        count: 100,
      };

      const result = defaultItemsExtractor(body);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should return body directly if it's an array", () => {
      const body = [{ id: 1 }, { id: 2 }];

      const result = defaultItemsExtractor(body);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should return null if no items found", () => {
      const body = {
        message: "success",
      };

      const result = defaultItemsExtractor(body);

      expect(result).toBeNull();
    });

    it("should return null for null body", () => {
      const result = defaultItemsExtractor(null);
      expect(result).toBeNull();
    });

    it("should return null for primitive body", () => {
      const result = defaultItemsExtractor("string");
      expect(result).toBeNull();
    });

    it("should extract items from data.items", () => {
      const body = {
        data: {
          items: [{ id: 1 }],
        },
      };

      expect(defaultItemsExtractor(body)).toEqual([{ id: 1 }]);
    });

    it("should extract items from data.results", () => {
      const body = {
        data: {
          results: [{ id: 1 }],
        },
      };

      expect(defaultItemsExtractor(body)).toEqual([{ id: 1 }]);
    });

    it("should extract items from records", () => {
      const body = {
        records: [{ id: 1 }, { id: 2 }],
      };

      expect(defaultItemsExtractor(body)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should extract items from rows", () => {
      const body = {
        rows: [{ id: 1 }],
      };

      expect(defaultItemsExtractor(body)).toEqual([{ id: 1 }]);
    });
  });

  describe("createItemsExtractorFromPath", () => {
    it("should extract items from custom path", () => {
      const body = {
        response: {
          records: [{ id: 1 }, { id: 2 }],
        },
      };

      const extractor = createItemsExtractorFromPath("response.records");
      const result = extractor(body);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("should return null if path doesn't exist", () => {
      const body = {
        data: {},
      };

      const extractor = createItemsExtractorFromPath("response.items");
      const result = extractor(body);

      expect(result).toBeNull();
    });

    it("should return null if path points to non-array", () => {
      const body = {
        response: {
          records: "not an array",
        },
      };

      const extractor = createItemsExtractorFromPath("response.records");
      const result = extractor(body);

      expect(result).toBeNull();
    });
  });

  describe("createExtractors", () => {
    it("should use custom extractors when provided", () => {
      const customItemsExtractor = jest.fn().mockReturnValue([{ id: 1 }]);
      const customPaginationExtractor = jest.fn().mockReturnValue({
        page: 1,
        size: 10,
        totalItems: 100,
      });

      const extractors = createExtractors({
        items: customItemsExtractor,
        pagination: customPaginationExtractor,
      });

      const body = { test: true };

      extractors.items(body);
      extractors.pagination(body);

      expect(customItemsExtractor).toHaveBeenCalledWith(body);
      expect(customPaginationExtractor).toHaveBeenCalledWith(body);
    });

    it("should use path-based extractors when paths provided", () => {
      const extractors = createExtractors(undefined, {
        items: "response.data",
        page: "response.meta.page",
        size: "response.meta.size",
        totalItems: "response.meta.total",
      });

      const body = {
        response: {
          data: [{ id: 1 }],
          meta: {
            page: 1,
            size: 10,
            total: 100,
          },
        },
      };

      expect(extractors.items(body)).toEqual([{ id: 1 }]);
      expect(extractors.pagination(body)).toEqual({
        page: 1,
        size: 10,
        totalItems: 100,
      });
    });

    it("should use default extractors when no config provided", () => {
      const extractors = createExtractors();

      const body = {
        data: {
          content: [{ id: 1 }],
          page: 1,
          size: 10,
          totalItems: 100,
        },
      };

      expect(extractors.items(body)).toEqual([{ id: 1 }]);
      expect(extractors.pagination(body)).toEqual({
        page: 1,
        size: 10,
        totalItems: 100,
        totalPages: undefined,
      });
    });

    it("should use default pagination when paths are incomplete", () => {
      const extractors = createExtractors(undefined, {
        items: "data.items",
        page: "meta.page",
      });

      const body = {
        data: {
          items: [{ id: 1 }],
          page: 1,
          size: 10,
          totalItems: 100,
        },
      };

      expect(extractors.items(body)).toEqual([{ id: 1 }]);
      expect(extractors.pagination(body)).toEqual({
        page: 1,
        size: 10,
        totalItems: 100,
        totalPages: undefined,
      });
    });

    it("should use custom pagination extractor over paths", () => {
      const customPaginationExtractor = jest.fn().mockReturnValue({
        page: 5,
        size: 25,
        totalItems: 500,
      });

      const extractors = createExtractors(
        { pagination: customPaginationExtractor },
        { page: "meta.page", size: "meta.size", totalItems: "meta.total" },
      );

      const body = { meta: { page: 1, size: 10, total: 100 } };
      extractors.pagination(body);

      expect(customPaginationExtractor).toHaveBeenCalledWith(body);
    });

    it("should prioritize custom extractors over paths", () => {
      const customItemsExtractor = jest
        .fn()
        .mockReturnValue([{ custom: true }]);

      const extractors = createExtractors(
        { items: customItemsExtractor },
        { items: "data.items" },
      );

      const body = {
        data: {
          items: [{ id: 1 }],
        },
      };

      const result = extractors.items(body);

      expect(customItemsExtractor).toHaveBeenCalled();
      expect(result).toEqual([{ custom: true }]);
    });
  });
});
