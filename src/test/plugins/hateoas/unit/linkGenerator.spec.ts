import {
  generateLink,
  generateSelfLink,
  generateLinks,
  generateItemLinks,
} from "@plugins/hateoas";
import type { LinkDefinition, LinkGeneratorContext } from "@plugins/hateoas";
import { FastifyRequest } from "fastify";

describe("linkGenerator", () => {
  const mockContext: LinkGeneratorContext = {
    request: { method: "GET", url: "/api/user" } as FastifyRequest,
    baseUrl: "https://api.example.com",
    routeUrl: "/api/user",
    params: {},
    query: {},
  };

  describe("generateLink", () => {
    it("should generate a link with path", () => {
      const definition: LinkDefinition = {
        rel: "self",
        method: "GET",
        path: "/api/user",
      };

      const link = generateLink(definition, mockContext);

      expect(link).toEqual({
        rel: "self",
        href: "https://api.example.com/api/user",
        method: "GET",
      });
    });

    it("should generate a link with href override", () => {
      const definition: LinkDefinition = {
        rel: "external",
        href: "https://external.com/resource",
      };

      const link = generateLink(definition, mockContext);

      expect(link).toEqual({
        rel: "external",
        href: "https://external.com/resource",
      });
    });

    it("should substitute path parameters", () => {
      const contextWithParams: LinkGeneratorContext = {
        ...mockContext,
        params: { id: "user-123" },
        routeUrl: "/api/user/user-123",
      };

      const definition: LinkDefinition = {
        rel: "self",
        method: "GET",
        path: "/api/user/:id",
      };

      const link = generateLink(definition, contextWithParams);

      expect(link.href).toBe("https://api.example.com/api/user/user-123");
    });

    it("should include title when provided", () => {
      const definition: LinkDefinition = {
        rel: "create",
        method: "POST",
        path: "/api/user",
        title: "Create a new user",
      };

      const link = generateLink(definition, mockContext);

      expect(link.title).toBe("Create a new user");
    });

    it("should fallback to routeUrl when no href or path provided", () => {
      const definition: LinkDefinition = {
        rel: "self",
        method: "GET",
      };

      const link = generateLink(definition, mockContext);

      expect(link.href).toBe("https://api.example.com/api/user");
    });

    it("should not include method when includeMethod is false", () => {
      const definition: LinkDefinition = {
        rel: "self",
        method: "GET",
        path: "/api/user",
      };

      const link = generateLink(definition, mockContext, false);

      expect(link.method).toBeUndefined();
    });
  });

  describe("generateSelfLink", () => {
    it("should generate self link with query params", () => {
      const contextWithQuery: LinkGeneratorContext = {
        ...mockContext,
        query: { page: "1", size: "10" },
      };

      const link = generateSelfLink(contextWithQuery, "GET");

      expect(link.rel).toBe("self");
      expect(link.href).toContain("page=1");
      expect(link.href).toContain("size=10");
      expect(link.method).toBe("GET");
    });

    it("should default to GET method", () => {
      const link = generateSelfLink(mockContext);

      expect(link.method).toBe("GET");
    });

    it("should not include method when includeMethod is false", () => {
      const link = generateSelfLink(mockContext, "GET", false);

      expect(link.rel).toBe("self");
      expect(link.method).toBeUndefined();
    });

    it("should generate self link without query params", () => {
      const link = generateSelfLink(mockContext, "GET");

      expect(link.href).toBe("https://api.example.com/api/user");
      expect(link.href).not.toContain("?");
    });
  });

  describe("generateLinks", () => {
    it("should generate multiple links", () => {
      const definitions: LinkDefinition[] = [
        { rel: "create", method: "POST", path: "/api/user" },
        { rel: "search", method: "GET", path: "/api/user/search" },
      ];

      const links = generateLinks(definitions, mockContext);

      expect(Object.keys(links)).toHaveLength(2);
      expect(links.create.href).toBe("https://api.example.com/api/user");
      expect(links.search.href).toBe("https://api.example.com/api/user/search");
    });
  });

  describe("generateItemLinks", () => {
    it("should generate links for an item", () => {
      const item = { id: "user-123", name: "John" };
      const itemLinksGenerator = (user: { id: string }) => [
        { rel: "self", method: "GET" as const, path: `/api/user/${user.id}` },
        { rel: "update", method: "PUT" as const, path: `/api/user/${user.id}` },
      ];

      const links = generateItemLinks(item, itemLinksGenerator, mockContext);

      expect(links.self.href).toBe("https://api.example.com/api/user/user-123");
      expect(links.update.href).toBe(
        "https://api.example.com/api/user/user-123",
      );
      expect(links.update.method).toBe("PUT");
    });
  });
});
