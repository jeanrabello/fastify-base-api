import Fastify, { FastifyInstance } from "fastify";
import hateoasPlugin from "@plugins/hateoas";

describe("fastify-hateoas Plugin Integration", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = Fastify();
    await app.register(hateoasPlugin, {
      baseUrl: "https://api.example.com",
      prefix: "/api",
      pagination: { enabled: true },
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it("should add _links to response", async () => {
    app.get("/api/user/:id", async () => {
      return {
        statusCode: 200,
        message: "Success",
        data: { id: "123", name: "John" },
      };
    });

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/user/123",
    });

    const body = JSON.parse(response.body);

    expect(body._links).toBeDefined();
    expect(body._links.self).toBeDefined();
    expect(body._links.self.href).toBe("https://api.example.com/api/user/123");
    expect(body._links.self.method).toBe("GET");
  });

  it("should add pagination links to collection response", async () => {
    app.get(
      "/api/user",
      {
        config: {
          hateoas: {
            collection: true,
            pagination: true,
          },
        },
      },
      async () => {
        return {
          statusCode: 200,
          message: "Success",
          data: {
            content: [{ id: "1" }, { id: "2" }],
            page: 2,
            size: 10,
            totalItems: 50,
          },
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/user?page=2&size=10",
    });

    const body = JSON.parse(response.body);

    expect(body._links.first).toBeDefined();
    expect(body._links.first.href).toContain("page=1");
    expect(body._links.prev).toBeDefined();
    expect(body._links.prev.href).toContain("page=1");
    expect(body._links.next).toBeDefined();
    expect(body._links.next.href).toContain("page=3");
    expect(body._links.last).toBeDefined();
    expect(body._links.last.href).toContain("page=5");
  });

  it("should add item links to collection items", async () => {
    app.get(
      "/api/user",
      {
        config: {
          hateoas: {
            collection: true,
            itemsPath: "data.content",
            itemLinks: (item: { id: string }) => [
              { rel: "self", method: "GET", path: `/api/user/${item.id}` },
              { rel: "update", method: "PUT", path: `/api/user/${item.id}` },
            ],
          },
        },
      },
      async () => {
        return {
          statusCode: 200,
          message: "Success",
          data: {
            content: [
              { id: "1", name: "John" },
              { id: "2", name: "Jane" },
            ],
          },
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/user",
    });

    const body = JSON.parse(response.body);

    expect(body.data.content[0]._links).toBeDefined();
    expect(body.data.content[0]._links.self.href).toBe(
      "https://api.example.com/api/user/1",
    );
    expect(body.data.content[1]._links.self.href).toBe(
      "https://api.example.com/api/user/2",
    );
    expect(body.data.content[0]._links.update.method).toBe("PUT");
  });

  it("should add custom links from route config", async () => {
    app.get(
      "/api/user/:id",
      {
        config: {
          hateoas: {
            links: [
              { rel: "collection", method: "GET", path: "/api/user" },
              { rel: "delete", method: "DELETE", path: "/api/user/:id" },
            ],
          },
        },
      },
      async () => {
        return {
          statusCode: 200,
          message: "Success",
          data: { id: "123", name: "John" },
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/user/123",
    });

    const body = JSON.parse(response.body);

    expect(body._links.collection).toBeDefined();
    expect(body._links.collection.href).toBe(
      "https://api.example.com/api/user",
    );
    expect(body._links.delete).toBeDefined();
    expect(body._links.delete.method).toBe("DELETE");
  });

  it("should not add links to error responses", async () => {
    app.get("/api/error", async (_request, reply) => {
      reply.status(404);
      return {
        statusCode: 404,
        message: "Not found",
      };
    });

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/error",
    });

    const body = JSON.parse(response.body);

    expect(body._links).toBeUndefined();
  });

  it("should exclude routes matching exclude patterns", async () => {
    const appWithExclusion = Fastify();
    await appWithExclusion.register(hateoasPlugin, {
      baseUrl: "https://api.example.com",
      exclude: ["/api/health", /\/api\/internal/],
    });

    appWithExclusion.get("/api/health", async () => {
      return { status: "ok" };
    });

    appWithExclusion.get("/api/internal/metrics", async () => {
      return { metrics: [] };
    });

    await appWithExclusion.ready();

    const healthResponse = await appWithExclusion.inject({
      method: "GET",
      url: "/api/health",
    });

    const metricsResponse = await appWithExclusion.inject({
      method: "GET",
      url: "/api/internal/metrics",
    });

    expect(JSON.parse(healthResponse.body)._links).toBeUndefined();
    expect(JSON.parse(metricsResponse.body)._links).toBeUndefined();

    await appWithExclusion.close();
  });

  it("should skip non-JSON content-type responses", async () => {
    app.get("/api/text", async (_request, reply) => {
      reply.header("content-type", "text/plain");
      return "plain text response";
    });

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/text",
    });

    expect(response.body).toBe("plain text response");
  });

  it("should skip non-object body", async () => {
    app.get("/api/null", async (_request, reply) => {
      reply.header("content-type", "application/json");
      return reply.send("null");
    });

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/null",
    });

    expect(response.body).toBe("null");
  });

  it("should skip invalid JSON payload", async () => {
    app.get("/api/bad-json", async (_request, reply) => {
      reply.header("content-type", "application/json");
      return reply.send("not valid json{");
    });

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/bad-json",
    });

    expect(response.body).toBe("not valid json{");
  });

  it("should throw error when baseUrl is not provided", async () => {
    const badApp = Fastify();

    await expect(
      badApp.register(hateoasPlugin, { baseUrl: "" }),
    ).rejects.toThrow("fastify-hateoas: baseUrl option is required");

    await badApp.close();
  });

  it("should support baseUrl as function", async () => {
    const funcApp = Fastify();
    await funcApp.register(hateoasPlugin, {
      baseUrl: (request) => `https://${request.headers.host || "default.com"}`,
    });

    funcApp.get("/api/user", async () => {
      return { data: { id: "1" } };
    });

    await funcApp.ready();

    const response = await funcApp.inject({
      method: "GET",
      url: "/api/user",
      headers: { host: "custom.example.com" },
    });

    const body = JSON.parse(response.body);

    expect(body._links.self.href).toBe("https://custom.example.com/api/user");

    await funcApp.close();
  });

  it("should not include method when includeMethod is false", async () => {
    const noMethodApp = Fastify();
    await noMethodApp.register(hateoasPlugin, {
      baseUrl: "https://api.example.com",
      includeMethod: false,
    });

    noMethodApp.get("/api/user", async () => {
      return { data: { id: "1" } };
    });

    await noMethodApp.ready();

    const response = await noMethodApp.inject({
      method: "GET",
      url: "/api/user",
    });

    const body = JSON.parse(response.body);

    expect(body._links.self.method).toBeUndefined();

    await noMethodApp.close();
  });

  it("should add item links using auto-detected items path", async () => {
    app.get(
      "/api/user",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              { rel: "self", method: "GET", path: `/api/user/${item.id}` },
            ],
          },
        },
      },
      async () => {
        return {
          statusCode: 200,
          data: {
            content: [
              { id: "1", name: "John" },
              { id: "2", name: "Jane" },
            ],
          },
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/user",
    });

    const body = JSON.parse(response.body);

    expect(body.data.content[0]._links).toBeDefined();
    expect(body.data.content[0]._links.self.href).toBe(
      "https://api.example.com/api/user/1",
    );
  });

  it("should handle item links with content at root level", async () => {
    app.get(
      "/api/items",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              { rel: "self", method: "GET", path: `/api/items/${item.id}` },
            ],
          },
        },
      },
      async () => {
        return {
          content: [{ id: "1" }, { id: "2" }],
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/items",
    });

    const body = JSON.parse(response.body);

    expect(body.content[0]._links).toBeDefined();
    expect(body.content[0]._links.self.href).toBe(
      "https://api.example.com/api/items/1",
    );
  });

  it("should handle item links with data.items path", async () => {
    app.get(
      "/api/data-items",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              {
                rel: "self",
                method: "GET",
                path: `/api/data-items/${item.id}`,
              },
            ],
          },
        },
      },
      async () => {
        return {
          data: {
            items: [{ id: "1" }, { id: "2" }],
          },
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/data-items",
    });

    const body = JSON.parse(response.body);

    expect(body.data.items[0]._links).toBeDefined();
  });

  it("should handle item links with data.results path", async () => {
    app.get(
      "/api/data-results",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              {
                rel: "self",
                method: "GET",
                path: `/api/data-results/${item.id}`,
              },
            ],
          },
        },
      },
      async () => {
        return {
          data: {
            results: [{ id: "1" }],
          },
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/data-results",
    });

    const body = JSON.parse(response.body);

    expect(body.data.results[0]._links).toBeDefined();
  });

  it("should handle item links with data as array", async () => {
    app.get(
      "/api/data-array",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              {
                rel: "self",
                method: "GET",
                path: `/api/data-array/${item.id}`,
              },
            ],
          },
        },
      },
      async () => {
        return {
          data: [{ id: "1" }, { id: "2" }],
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/data-array",
    });

    const body = JSON.parse(response.body);

    expect(body.data[0]._links).toBeDefined();
  });

  it("should handle item links with items at root", async () => {
    app.get(
      "/api/root-items",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              {
                rel: "self",
                method: "GET",
                path: `/api/root-items/${item.id}`,
              },
            ],
          },
        },
      },
      async () => {
        return {
          items: [{ id: "1" }],
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/root-items",
    });

    const body = JSON.parse(response.body);

    expect(body.items[0]._links).toBeDefined();
  });

  it("should handle item links with results at root", async () => {
    app.get(
      "/api/root-results",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              {
                rel: "self",
                method: "GET",
                path: `/api/root-results/${item.id}`,
              },
            ],
          },
        },
      },
      async () => {
        return {
          results: [{ id: "1" }],
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/root-results",
    });

    const body = JSON.parse(response.body);

    expect(body.results[0]._links).toBeDefined();
  });

  it("should handle item links with records at root", async () => {
    app.get(
      "/api/root-records",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              {
                rel: "self",
                method: "GET",
                path: `/api/root-records/${item.id}`,
              },
            ],
          },
        },
      },
      async () => {
        return {
          records: [{ id: "1" }],
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/root-records",
    });

    const body = JSON.parse(response.body);

    expect(body.records[0]._links).toBeDefined();
  });

  it("should handle itemsPath pointing to non-array", async () => {
    app.get(
      "/api/bad-path",
      {
        config: {
          hateoas: {
            collection: true,
            itemsPath: "data.nonexistent",
            itemLinks: (item: { id: string }) => [
              { rel: "self", method: "GET", path: `/api/bad-path/${item.id}` },
            ],
          },
        },
      },
      async () => {
        return {
          data: { value: "not an array" },
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/bad-path",
    });

    const body = JSON.parse(response.body);

    expect(body._links.self).toBeDefined();
    expect(body.data.value).toBe("not an array");
  });

  it("should not add item links when no items found by extractor", async () => {
    app.get(
      "/api/no-items",
      {
        config: {
          hateoas: {
            collection: true,
            itemLinks: (item: { id: string }) => [
              { rel: "self", method: "GET", path: `/api/no-items/${item.id}` },
            ],
          },
        },
      },
      async () => {
        return {
          message: "No items here",
          count: 0,
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/no-items",
    });

    const body = JSON.parse(response.body);

    expect(body._links.self).toBeDefined();
    expect(body.message).toBe("No items here");
  });

  it("should respect disabled config on route", async () => {
    app.get(
      "/api/no-hateoas",
      {
        config: {
          hateoas: {
            disabled: true,
          },
        },
      },
      async () => {
        return {
          statusCode: 200,
          message: "Success",
          data: { value: "test" },
        };
      },
    );

    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/api/no-hateoas",
    });

    const body = JSON.parse(response.body);

    expect(body._links).toBeUndefined();
  });
});
