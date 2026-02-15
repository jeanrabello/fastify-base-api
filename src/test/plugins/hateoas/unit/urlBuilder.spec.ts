import {
  buildUrl,
  buildUrlWithQuery,
  getOriginFromUrl,
} from "@plugins/hateoas";
import { extractPathFromUrl } from "@plugins/hateoas/utils/urlBuilder";

describe("urlBuilder", () => {
  describe("buildUrl", () => {
    it("should build a URL from baseUrl and path", () => {
      const result = buildUrl("https://api.example.com", "/api/user");

      expect(result).toBe("https://api.example.com/api/user");
    });

    it("should substitute path params", () => {
      const result = buildUrl("https://api.example.com", "/api/user/:id", {
        id: "123",
      });

      expect(result).toBe("https://api.example.com/api/user/123");
    });

    it("should encode path param values", () => {
      const result = buildUrl("https://api.example.com", "/api/user/:name", {
        name: "John Doe",
      });

      expect(result).toBe("https://api.example.com/api/user/John%20Doe");
    });

    it("should normalize path without leading slash", () => {
      const result = buildUrl("https://api.example.com", "api/user");

      expect(result).toBe("https://api.example.com/api/user");
    });

    it("should build URL without params", () => {
      const result = buildUrl("https://api.example.com", "/api/user");

      expect(result).toBe("https://api.example.com/api/user");
    });
  });

  describe("getOriginFromUrl", () => {
    it("should extract origin from valid URL", () => {
      expect(getOriginFromUrl("https://api.example.com/api/user")).toBe(
        "https://api.example.com",
      );
    });

    it("should extract origin with port", () => {
      expect(getOriginFromUrl("http://localhost:3000/api")).toBe(
        "http://localhost:3000",
      );
    });

    it("should fallback to regex for invalid URL", () => {
      expect(getOriginFromUrl("http://api.example.com:bad")).toBe(
        "http://api.example.com:bad",
      );
    });

    it("should return input when regex also fails", () => {
      expect(getOriginFromUrl("not-a-url")).toBe("not-a-url");
    });
  });

  describe("buildUrlWithQuery", () => {
    it("should build URL with query params", () => {
      const result = buildUrlWithQuery("https://api.example.com", "/api/user", {
        page: 1,
        size: 10,
      });

      expect(result).toContain("page=1");
      expect(result).toContain("size=10");
    });

    it("should return URL without query string when empty", () => {
      const result = buildUrlWithQuery(
        "https://api.example.com",
        "/api/user",
        {},
      );

      expect(result).toBe("https://api.example.com/api/user");
    });
  });

  describe("extractPathFromUrl", () => {
    it("should extract path from URL", () => {
      expect(
        extractPathFromUrl("https://api.example.com/api/user?page=1"),
      ).toBe("/api/user");
    });

    it("should extract path from relative URL", () => {
      expect(extractPathFromUrl("/api/user?page=1")).toBe("/api/user");
    });

    it("should handle relative URL with query string", () => {
      expect(extractPathFromUrl("/api/user?page=1&size=10")).toBe("/api/user");
    });
  });
});
