# Schemas Development Guide

## Overview

Schemas define validation rules and OpenAPI documentation for API endpoints. They integrate Zod validation with Fastify's schema system to provide both runtime validation and automatic API documentation generation.

## Architecture Pattern

### Base Structure

All schemas use Zod for validation and follow Fastify's schema format:

```typescript
import { z } from "@utils/index";

const {action}{ModuleName}Schema = {
  schema: {
    tags: ["{ModuleName}s"],
    description: "{Action description}",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    // Define body, params, querystring as needed
    body?: z.object({ /* validation rules */ }),
    params?: z.object({ /* URL parameters */ }),
    querystring?: z.object({ /* query parameters */ }),
    response: {
      // Define response schemas for each status code
      200: z.object({ /* success response */ }),
      400: z.object({ /* validation error */ }),
      404: z.object({ /* not found */ }),
      // Add other status codes as needed
    },
  },
};
```

## Schema Templates

### 1. Create Operation Schema

```typescript
import { z } from "@utils/index";

const create{ModuleName}Schema = {
  schema: {
    tags: ["{ModuleName}s"],
    description: "Create a new {moduleName}",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    body: z.object({
      // Required fields for creation
      name: z.string().min(1).max(100),
      email: z.string().email(),
      // Optional fields
      description: z.string().optional(),
    }),
    response: {
      201: z
        .object({
          statusCode: z.number().default(201),
          message: z
            .string()
            .describe("{ModuleName} created successfully")
            .default("{ModuleName} created successfully"),
          data: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            createdAt: z.date(),
          }),
        })
        .describe("{ModuleName} created successfully"),
      400: z
        .object({
          statusCode: z.number().default(400),
          message: z.string().describe("Validation error"),
        })
        .describe("Bad request - validation failed"),
      409: z
        .object({
          statusCode: z.number().default(409),
          message: z.string().describe("Conflict error"),
        })
        .describe("Conflict - resource already exists"),
      500: z
        .object({
          statusCode: z.number().default(500),
          message: z.string().describe("Internal server error"),
        })
        .describe("Internal server error"),
    },
  },
};

export { create{ModuleName}Schema };
```

### 2. Find by ID Schema

```typescript
import { z } from "@utils/index";

const find{ModuleName}Schema = {
  schema: {
    tags: ["{ModuleName}s"],
    description: "Find {moduleName} by ID",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    params: z.object({
      id: z.string().min(1).describe("{ModuleName} ID"),
    }),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z
            .string()
            .describe("{ModuleName} found")
            .default("{ModuleName} found"),
          data: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
        })
        .describe("{ModuleName} found successfully"),
      404: z
        .object({
          statusCode: z.number().default(404),
          message: z.string().describe("{ModuleName} not found"),
        })
        .describe("{ModuleName} not found"),
      500: z
        .object({
          statusCode: z.number().default(500),
          message: z.string().describe("Internal server error"),
        })
        .describe("Internal server error"),
    },
  },
};

export { find{ModuleName}Schema };
```

### 3. List with Pagination Schema

```typescript
import { z } from "@utils/index";

const list{ModuleName}sSchema = {
  schema: {
    tags: ["{ModuleName}s"],
    description: "List {moduleName}s with pagination",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    querystring: z.object({
      page: z.number().int().min(1).optional().default(1),
      size: z.number().int().min(1).max(100).optional().default(10),
      // Add filtering options
      status: z.enum(['active', 'inactive']).optional(),
      search: z.string().optional(),
    }),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z
            .string()
            .describe("{ModuleName}s retrieved successfully")
            .default("{ModuleName}s retrieved successfully"),
          data: z.object({
            items: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                status: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
              })
            ),
            pagination: z.object({
              page: z.number(),
              size: z.number(),
              totalItems: z.number(),
              totalPages: z.number(),
              hasNextPage: z.boolean(),
              hasPreviousPage: z.boolean(),
            }),
          }),
        })
        .describe("{ModuleName}s list with pagination"),
      500: z
        .object({
          statusCode: z.number().default(500),
          message: z.string().describe("Internal server error"),
        })
        .describe("Internal server error"),
    },
  },
};

export { list{ModuleName}sSchema };
```

### 4. Update Schema

```typescript
import { z } from "@utils/index";

const update{ModuleName}Schema = {
  schema: {
    tags: ["{ModuleName}s"],
    description: "Update {moduleName}",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    params: z.object({
      id: z.string().min(1).describe("{ModuleName} ID"),
    }),
    body: z.object({
      // All fields optional for partial updates
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }),
    response: {
      200: z
        .object({
          statusCode: z.number().default(200),
          message: z
            .string()
            .describe("{ModuleName} updated successfully")
            .default("{ModuleName} updated successfully"),
          data: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            updatedAt: z.date(),
          }),
        })
        .describe("{ModuleName} updated successfully"),
      400: z
        .object({
          statusCode: z.number().default(400),
          message: z.string().describe("Validation error"),
        })
        .describe("Bad request - validation failed"),
      404: z
        .object({
          statusCode: z.number().default(404),
          message: z.string().describe("{ModuleName} not found"),
        })
        .describe("{ModuleName} not found"),
      409: z
        .object({
          statusCode: z.number().default(409),
          message: z.string().describe("Conflict error"),
        })
        .describe("Conflict - duplicate data"),
      500: z
        .object({
          statusCode: z.number().default(500),
          message: z.string().describe("Internal server error"),
        })
        .describe("Internal server error"),
    },
  },
};

export { update{ModuleName}Schema };
```

### 5. Delete Schema

```typescript
import { z } from "@utils/index";

const delete{ModuleName}Schema = {
  schema: {
    tags: ["{ModuleName}s"],
    description: "Delete {moduleName}",
    headers: z.object({
      "accept-language": z.string().optional().default("en-US"),
    }),
    params: z.object({
      id: z.string().min(1).describe("{ModuleName} ID"),
    }),
    response: {
      204: z
        .object({
          statusCode: z.number().default(204),
          message: z
            .string()
            .describe("{ModuleName} deleted successfully")
            .default("{ModuleName} deleted successfully"),
        })
        .describe("{ModuleName} deleted successfully"),
      404: z
        .object({
          statusCode: z.number().default(404),
          message: z.string().describe("{ModuleName} not found"),
        })
        .describe("{ModuleName} not found"),
      500: z
        .object({
          statusCode: z.number().default(500),
          message: z.string().describe("Internal server error"),
        })
        .describe("Internal server error"),
    },
  },
};

export { delete{ModuleName}Schema };
```

## Validation Rules

### Common Zod Validators

#### String Validation

```typescript
// Basic string
name: z.string(),

// String with length constraints
name: z.string().min(1).max(100),

// String with regex pattern
username: z.string().regex(/^[a-zA-Z0-9_]+$/),

// Email validation
email: z.string().email(),

// URL validation
website: z.string().url().optional(),

// Enum validation
status: z.enum(['active', 'inactive', 'pending']),
```

#### Number Validation

```typescript
// Basic number
age: z.number(),

// Integer with range
age: z.number().int().min(0).max(120),

// Positive number
price: z.number().positive(),

// Optional with default
page: z.number().int().min(1).optional().default(1),
```

#### Date Validation

```typescript
// Date validation
birthDate: z.date(),

// Date string that converts to Date
birthDate: z.string().datetime().transform(str => new Date(str)),

// Optional date
lastLogin: z.date().optional(),
```

#### Array Validation

```typescript
// Array of strings
tags: z.array(z.string()),

// Array with length constraints
tags: z.array(z.string()).min(1).max(10),

// Array of objects
items: z.array(z.object({
  id: z.string(),
  quantity: z.number().int().min(1),
})),
```

#### Object Validation

```typescript
// Nested object
address: z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
  country: z.string().length(2), // ISO country code
}),

// Optional nested object
profile: z.object({
  firstName: z.string(),
  lastName: z.string(),
}).optional(),
```

## Schema Index File

Create an index file to export all schemas:

```typescript
// src/modules/{moduleName}/schemas/index.ts
export { create{ModuleName}Schema } from "./create{ModuleName}Schema";
export { find{ModuleName}Schema } from "./find{ModuleName}Schema";
export { list{ModuleName}sSchema } from "./list{ModuleName}sSchema";
export { update{ModuleName}Schema } from "./update{ModuleName}Schema";
export { delete{ModuleName}Schema } from "./delete{ModuleName}Schema";
```

## Response Schema Patterns

### Success Response Structure

```typescript
// Standard success response
{
  statusCode: z.number(),
  message: z.string().optional(),
  data: z.object({ /* entity data */ }).optional(),
}

// Paginated response
{
  statusCode: z.number(),
  message: z.string().optional(),
  data: z.object({
    items: z.array(/* entity schema */),
    pagination: z.object({
      page: z.number(),
      size: z.number(),
      totalItems: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
    }),
  }),
}
```

### Error Response Structure

```typescript
// Standard error response
{
  statusCode: z.number(),
  message: z.string(),
  data: z.object({}).optional(), // Usually empty for errors
}

// Validation error with details
{
  statusCode: z.number().default(400),
  message: z.string(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
}
```

## OpenAPI Documentation

### Tags and Descriptions

```typescript
// Group related endpoints
tags: ["Users", "Products", "Orders"],

// Clear descriptions
description: "Create a new user account with email and password",

// Field descriptions
body: z.object({
  email: z.string().email().describe("User's email address"),
  password: z.string().min(8).describe("Password (8-16 characters)"),
}),
```

### Response Documentation

```typescript
response: {
  201: z.object({
    statusCode: z.number().default(201),
    message: z.string().default("User created successfully"),
    data: z.object({
      id: z.string().describe("Unique user identifier"),
      email: z.string().describe("User's email address"),
    }),
  }).describe("User created successfully"),

  400: z.object({
    statusCode: z.number().default(400),
    message: z.string().describe("Validation error message"),
  }).describe("Bad request - validation failed"),
}
```

## Advanced Validation

### Conditional Validation

```typescript
// Different validation based on action
body: z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    name: z.string().min(1), // Required for create
    email: z.string().email(), // Required for create
  }),
  z.object({
    action: z.literal("update"),
    name: z.string().min(1).optional(), // Optional for update
    email: z.string().email().optional(), // Optional for update
  }),
]),
```

### Custom Validation

```typescript
// Custom validation with refine
password: z.string().min(8).max(16).refine(
  (val) => /[A-Z]/.test(val),
  { message: "Password must contain at least one uppercase letter" }
).refine(
  (val) => /[0-9]/.test(val),
  { message: "Password must contain at least one number" }
),

// Cross-field validation
z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}),
```

## File Organization

```
src/modules/{moduleName}/schemas/
├── index.ts                      # Export all schemas
├── create{ModuleName}Schema.ts   # Create operation
├── find{ModuleName}Schema.ts     # Find by ID operation
├── list{ModuleName}sSchema.ts    # List with pagination
├── update{ModuleName}Schema.ts   # Update operation
└── delete{ModuleName}Schema.ts   # Delete operation
```

## Best Practices

### 1. Consistency

- Use the same validation patterns across modules
- Maintain consistent response structures
- Follow naming conventions

### 2. Security

- Validate all inputs thoroughly
- Set reasonable limits on string lengths and numbers
- Use whitelist validation for enums

### 3. Documentation

- Provide clear descriptions for all fields
- Use meaningful examples
- Group related endpoints with tags

### 4. Performance

- Keep validation rules efficient
- Avoid overly complex validation logic
- Use appropriate data types

### 5. Maintainability

- Reuse common validation patterns
- Keep schemas focused and simple
- Update documentation with schema changes

## Testing Schemas

### Validation Testing

```typescript
// Test valid input
it("should accept valid create user data", () => {
  const validData = {
    username: "testuser",
    email: "test@example.com",
    password: "SecurePass123",
  };

  const result = createUserSchema.schema.body.safeParse(validData);
  expect(result.success).toBe(true);
});

// Test invalid input
it("should reject invalid email", () => {
  const invalidData = {
    username: "testuser",
    email: "invalid-email",
    password: "SecurePass123",
  };

  const result = createUserSchema.schema.body.safeParse(invalidData);
  expect(result.success).toBe(false);
});
```

## Common HTTP Status Codes

- **200**: Success (GET, PUT)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (authorization failed)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate data)
- **422**: Unprocessable Entity (business logic error)
- **500**: Internal Server Error (server error)
