# fastify-hateoas

Fastify plugin for adding HATEOAS (Hypermedia as the Engine of Application State) support to REST APIs.

## Features

- **Auto-detection of formats**: Automatically detects common response structures
- **Flexible configuration**: Support for custom paths and extractor functions
- **Automatic pagination links**: Generates first, prev, next, last links
- **Per-item links**: Adds links to each item in a collection
- **HAL style**: Uses the HAL (Hypertext Application Language) `_links` format

## Installation

The plugin uses `fastify-plugin` as a dependency:

```bash
npm install fastify-plugin
```

## Basic Usage

### 1. Register the Plugin

```typescript
import { fastify } from "fastify";
import { hateoasPlugin } from "./plugins/hateoas";

const app = fastify();

// Minimal configuration - uses auto-detection
app.register(hateoasPlugin, {
  baseUrl: "https://api.example.com",
});
```

### 2. Configure Routes

```typescript
app.get(
  "/users",
  {
    config: {
      hateoas: {
        collection: true,
        pagination: true,
        itemLinks: (user) => [
          { rel: "self", method: "GET", path: `/api/users/${user.id}` },
          { rel: "update", method: "PUT", path: `/api/users/${user.id}` },
        ],
      },
    },
  },
  handler,
);
```

## Supported Response Formats

The plugin automatically detects the following formats:

### Items (in priority order)

```typescript
body.data?.content; // Common custom API format
body.content; // Spring Boot
body.data; // If data is an array
body.items; // Common
body.results; // Django REST Framework
body.records; // Various
body; // If body is a direct array
```

### Pagination (automatically detected)

```typescript
// Format 1: Nested in data
{
  data: {
    page, size, totalItems;
  }
}

// Format 2: Spring Boot
{
  number, size, totalElements, totalPages;
}

// Format 3: Root level
{
  page, size, totalItems;
}

// Format 4: page + limit + total
{
  page, limit, total;
}

// Format 5: GitHub style
{
  page, per_page, total_count;
}

// Format 6: Meta object
{
  meta: {
    page, perPage, total;
  }
}

// Format 7: Pagination object
{
  pagination: {
    page, size, totalItems;
  }
}
```

## Advanced Configuration

### Plugin Options

```typescript
interface FastifyHateoasOptions {
  // Base URL for link generation (required)
  baseUrl: string | ((request: FastifyRequest) => string);

  // API prefix (for documentation purposes)
  prefix?: string;

  // Pagination configuration
  pagination?: {
    enabled?: boolean; // default: true
    pageParam?: string; // default: "page"
    sizeParam?: string; // default: "size"
    startPage?: 0 | 1; // default: 1
  };

  // Include HTTP method in link objects
  includeMethod?: boolean; // default: true

  // Routes to exclude from processing
  exclude?: (string | RegExp)[];

  // Custom extractor functions
  extractors?: {
    items?: (body: unknown) => unknown[] | null;
    pagination?: (body: unknown) => PaginationData | null;
  };

  // Paths for data extraction (simpler alternative to extractors)
  paths?: {
    items?: string; // e.g. "data.content"
    totalItems?: string; // e.g. "meta.total"
    page?: string; // e.g. "meta.page"
    size?: string; // e.g. "meta.perPage"
  };
}
```

### Example with Custom Paths

```typescript
app.register(hateoasPlugin, {
  baseUrl: "https://api.example.com",
  paths: {
    items: "response.records",
    totalItems: "response.meta.total",
    page: "response.meta.page",
    size: "response.meta.limit",
  },
});
```

### Example with Custom Extractors

```typescript
app.register(hateoasPlugin, {
  baseUrl: "https://api.example.com",
  extractors: {
    items: (body) => {
      if (Array.isArray(body)) return body;
      return body?.response?.data ?? null;
    },
    pagination: (body) => {
      const meta = body?.response?.metadata;
      if (!meta) return null;
      return {
        page: meta.currentPage,
        size: meta.itemsPerPage,
        totalItems: meta.totalRecords,
      };
    },
  },
});
```

## Per-Route Configuration

```typescript
interface RouteHateoasConfig {
  // Indicates whether this is a collection
  collection?: boolean;

  // Enables automatic pagination links
  pagination?: boolean;

  // Additional links for the response
  links?: LinkDefinition[];

  // Function to generate per-item links in a collection
  itemLinks?: (item: any, context: LinkGeneratorContext) => LinkDefinition[];

  // Path to the items array (overrides global config)
  itemsPath?: string;

  // Disables HATEOAS for this route
  disabled?: boolean;
}
```

## Usage Examples

### API with Default Format (Auto-detection)

```typescript
// API response
{
  "data": {
    "content": [{ "id": 1 }, { "id": 2 }],
    "page": 1,
    "size": 10,
    "totalItems": 100
  }
}

// Minimal configuration - auto-detection works out of the box
app.register(hateoasPlugin, {
  baseUrl: "https://api.example.com",
});
```

### Spring Boot API

```typescript
// Spring Boot response
{
  "content": [{ "id": 1 }, { "id": 2 }],
  "number": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10
}

// Auto-detection works for Spring Boot
app.register(hateoasPlugin, {
  baseUrl: "https://api.example.com",
  pagination: {
    startPage: 0,  // Spring Boot uses 0-indexed pages
  },
});
```

### API with Direct Array

```typescript
// Simple response
[{ id: 1 }, { id: 2 }];

// Works automatically
app.get(
  "/items",
  {
    config: {
      hateoas: {
        collection: true,
        itemLinks: (item) => [{ rel: "self", path: `/api/items/${item.id}` }],
      },
    },
  },
  handler,
);
```

### API with Custom Structure

```typescript
// Custom response
{
  "response": {
    "records": [{ "id": 1 }],
    "paging": {
      "currentPage": 1,
      "itemsPerPage": 10,
      "totalRecords": 100
    }
  }
}

// Use paths or extractors
app.register(hateoasPlugin, {
  baseUrl: "https://api.example.com",
  paths: {
    items: "response.records",
    page: "response.paging.currentPage",
    size: "response.paging.itemsPerPage",
    totalItems: "response.paging.totalRecords",
  },
});
```

## HATEOAS Response

```json
{
  "data": {
    "content": [
      {
        "id": "user-123",
        "name": "John",
        "_links": {
          "self": {
            "rel": "self",
            "href": "https://api.com/api/users/user-123",
            "method": "GET"
          },
          "update": {
            "rel": "update",
            "href": "https://api.com/api/users/user-123",
            "method": "PUT"
          }
        }
      }
    ],
    "page": 1,
    "size": 10,
    "totalItems": 100
  },
  "_links": {
    "self": {
      "rel": "self",
      "href": "https://api.com/api/users?page=1&size=10",
      "method": "GET"
    },
    "first": {
      "rel": "first",
      "href": "https://api.com/api/users?page=1&size=10"
    },
    "next": {
      "rel": "next",
      "href": "https://api.com/api/users?page=2&size=10"
    },
    "last": {
      "rel": "last",
      "href": "https://api.com/api/users?page=10&size=10"
    }
  }
}
```

## TypeScript Integration

Add the Fastify type augmentation:

```typescript
// types/fastify.d.ts
import {
  RouteHateoasConfig,
  LinkGeneratorContext,
} from "./plugins/hateoas/types";

declare module "fastify" {
  interface FastifyRequest {
    hateoasContext: LinkGeneratorContext;
  }

  interface FastifyContextConfig {
    hateoas?: RouteHateoasConfig;
  }
}
```

## Important Notes

### Full Paths

Link paths must be **complete**, including the API prefix:

```typescript
// ✅ Correct
{ rel: "self", path: "/api/users/123" }

// ❌ Incorrect
{ rel: "self", path: "/users/123" }
```

### Hook Order

Register the HATEOAS plugin **after** other middlewares that modify the response:

```typescript
app.register(translationPlugin);
app.register(hateoasPlugin, { baseUrl: "..." });
app.register(routes);
```

### Error Responses

HATEOAS links are not added to responses with `statusCode >= 400`.

## Plugin Structure

```
hateoas/
├── index.ts              # Exports
├── plugin.ts             # Main plugin
├── types/
│   ├── index.ts          # Type exports
│   ├── links.ts          # Link types
│   └── options.ts        # Configuration types
├── hooks/
│   ├── onRequest.ts      # Creates HATEOAS context
│   └── onSend.ts         # Adds links to response
├── generators/
│   ├── linkGenerator.ts  # Link generation
│   └── paginationLinks.ts# Pagination links
└── utils/
    ├── urlBuilder.ts     # URL building
    └── extractors.ts     # Data extractors
```

## License

MIT
