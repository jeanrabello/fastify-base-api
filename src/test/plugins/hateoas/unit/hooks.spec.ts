import { createOnSendHook } from "@plugins/hateoas/hooks/onSend";
import { createOnRequestHook } from "@plugins/hateoas/hooks/onRequest";
import type { ResolvedHateoasOptions } from "@plugins/hateoas/plugin";
import { defaultItemsExtractor, defaultPaginationExtractor } from "@plugins/hateoas";
import { FastifyRequest, FastifyReply } from "fastify";

describe("hooks", () => {
  const defaultOptions: ResolvedHateoasOptions = {
    baseUrl: "https://api.example.com",
    includeMethod: true,
    pagination: {
      enabled: true,
      pageParam: "page",
      sizeParam: "size",
      startPage: 1,
    },
    extractors: {
      items: defaultItemsExtractor,
      pagination: defaultPaginationExtractor,
    },
  };

  describe("createOnSendHook", () => {
    it("should return payload when hateoasContext is missing", async () => {
      const hook = createOnSendHook(defaultOptions);
      const request = {
        url: "/api/test",
        routeOptions: { config: {} },
        hateoasContext: undefined,
      } as unknown as FastifyRequest;
      const reply = {
        getHeader: () => "application/json",
        statusCode: 200,
      } as unknown as FastifyReply;

      const payload = JSON.stringify({ data: "test" });
      const result = await hook(request, reply, payload);

      expect(result).toBe(payload);
    });

    it("should return payload when onSend throws an error", async () => {
      const hook = createOnSendHook(defaultOptions);
      const request = {
        url: "/api/test",
        routeOptions: { config: {} },
        hateoasContext: {
          request: { method: "GET" },
          baseUrl: "https://api.example.com",
          routeUrl: "/api/test",
          params: {},
          query: {},
        },
      } as unknown as FastifyRequest;
      const reply = {
        getHeader: () => "application/json",
        statusCode: 200,
      } as unknown as FastifyReply;

      // Pass an object that will cause JSON.stringify to fail in the hook
      const circularObj: any = {};
      circularObj.self = circularObj;

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await hook(request, reply, circularObj);

      expect(result).toBe(circularObj);
      expect(consoleSpy).toHaveBeenCalledWith(
        "HATEOAS plugin error:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should return payload for itemLinks route with no itemLinks function", async () => {
      const hook = createOnSendHook(defaultOptions);
      const request = {
        url: "/api/test",
        routeOptions: {
          config: {
            hateoas: {
              itemLinks: undefined,
            },
          },
        },
        hateoasContext: {
          request: { method: "GET" },
          baseUrl: "https://api.example.com",
          routeUrl: "/api/test",
          params: {},
          query: {},
        },
      } as unknown as FastifyRequest;
      const reply = {
        getHeader: () => "application/json",
        statusCode: 200,
      } as unknown as FastifyReply;

      const payload = JSON.stringify({ data: "test" });
      const result = await hook(request, reply, payload);
      const body = JSON.parse(result as string);

      expect(body._links.self).toBeDefined();
    });
  });

  describe("createOnRequestHook", () => {
    it("should set hateoasContext with string baseUrl", async () => {
      const hook = createOnRequestHook({ baseUrl: "https://api.example.com" });
      const request = {
        url: "/api/test",
        params: { id: "1" },
        query: { page: "1" },
      } as unknown as FastifyRequest;
      const reply = {} as FastifyReply;

      await hook(request, reply);

      expect(request.hateoasContext).toBeDefined();
      expect(request.hateoasContext.baseUrl).toBe("https://api.example.com");
      expect(request.hateoasContext.routeUrl).toBe("/api/test");
    });

    it("should default params and query to empty objects when falsy", async () => {
      const hook = createOnRequestHook({ baseUrl: "https://api.example.com" });
      const request = {
        url: "/api/test",
        params: undefined,
        query: undefined,
      } as unknown as FastifyRequest;
      const reply = {} as FastifyReply;

      await hook(request, reply);

      expect(request.hateoasContext.params).toEqual({});
      expect(request.hateoasContext.query).toEqual({});
    });

    it("should set hateoasContext with function baseUrl", async () => {
      const hook = createOnRequestHook({
        baseUrl: (req) => `https://${(req.headers as any)?.host || "default.com"}`,
      });
      const request = {
        url: "/api/test",
        headers: { host: "custom.example.com" },
        params: {},
        query: {},
      } as unknown as FastifyRequest;
      const reply = {} as FastifyReply;

      await hook(request, reply);

      expect(request.hateoasContext.baseUrl).toBe("https://custom.example.com");
    });
  });
});
