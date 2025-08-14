# Modules Development Guide

## Overview

Modules are self-contained feature packages that encapsulate all related functionality for a specific domain. Each module follows a consistent structure and includes controllers, use cases, repositories, models, schemas, translations, and routes.

## Module Structure

```
src/modules/{moduleName}/
├── {moduleName}.routes.ts          # Route definitions and dependency injection
├── controllers/                     # HTTP request handlers
│   ├── Create{ModuleName}Controller.ts
│   ├── Find{ModuleName}Controller.ts
│   ├── List{ModuleName}sController.ts
│   ├── Update{ModuleName}Controller.ts
│   └── Delete{ModuleName}Controller.ts
├── useCases/                       # Business logic
│   ├── Create{ModuleName}UseCase.ts
│   ├── Find{ModuleName}ByIdUseCase.ts
│   ├── List{ModuleName}sPaginatedUseCase.ts
│   ├── Update{ModuleName}UseCase.ts
│   └── Delete{ModuleName}ByIdUseCase.ts
├── models/                         # Data transfer objects
│   ├── Request/
│   │   ├── Create{ModuleName}Request.model.ts
│   │   ├── Update{ModuleName}Request.model.ts
│   │   ├── {ModuleName}IdParams.model.ts
│   │   └── List{ModuleName}sPaginatedParams.model.ts
│   └── Response/
│       ├── Create{ModuleName}Response.model.ts
│       ├── Find{ModuleName}Response.model.ts
│       └── List{ModuleName}sPaginatedResponse.model.ts
├── schemas/                        # Validation schemas and OpenAPI docs
│   ├── index.ts
│   ├── create{ModuleName}Schema.ts
│   ├── find{ModuleName}Schema.ts
│   ├── list{ModuleName}sSchema.ts
│   ├── update{ModuleName}Schema.ts
│   └── delete{ModuleName}Schema.ts
├── types/                          # Interfaces and type definitions
│   ├── I{ModuleName}Repository.ts
│   └── I{ModuleName}Translation.ts
└── lang/                           # Internationalization
    ├── index.tsx
    ├── en-us.ts
    └── pt-br.ts
```

## Module Routes Template

```typescript
import { FastifyTypedInstance } from "@src/shared/types/fastifyTypedInstance";
import { routeAdapter } from "@utils/routeAdapter";

// Controllers
import { Create{ModuleName}Controller } from "@modules/{moduleName}/controllers/Create{ModuleName}Controller";
import { Find{ModuleName}Controller } from "@modules/{moduleName}/controllers/Find{ModuleName}Controller";
import { List{ModuleName}sController } from "@modules/{moduleName}/controllers/List{ModuleName}sController";
import { Update{ModuleName}Controller } from "@modules/{moduleName}/controllers/Update{ModuleName}Controller";
import { Delete{ModuleName}Controller } from "@modules/{moduleName}/controllers/Delete{ModuleName}Controller";

// Use Cases
import { Create{ModuleName}UseCase } from "@modules/{moduleName}/useCases/Create{ModuleName}UseCase";
import { Find{ModuleName}ByIdUseCase } from "@modules/{moduleName}/useCases/Find{ModuleName}ByIdUseCase";
import { List{ModuleName}sPaginatedUseCase } from "@modules/{moduleName}/useCases/List{ModuleName}sPaginatedUseCase";
import { Update{ModuleName}UseCase } from "@modules/{moduleName}/useCases/Update{ModuleName}UseCase";
import { Delete{ModuleName}ByIdUseCase } from "@modules/{moduleName}/useCases/Delete{ModuleName}ByIdUseCase";

// Repository
import { Mongo{ModuleName}Repository } from "@src/infra/mongo/repositories/{moduleName}/Mongo{ModuleName}Repository";

// Schemas
import {
  create{ModuleName}Schema,
  find{ModuleName}Schema,
  list{ModuleName}sSchema,
  update{ModuleName}Schema,
  delete{ModuleName}Schema,
} from "@modules/{moduleName}/schemas";

const {moduleName}Routes = (app: FastifyTypedInstance) => {
  // Create
  app.post(
    "/",
    create{ModuleName}Schema,
    routeAdapter(
      new Create{ModuleName}Controller({
        create{ModuleName}UseCase: new Create{ModuleName}UseCase({
          {moduleName}Repository: new Mongo{ModuleName}Repository(),
        }),
      }),
    ),
  );

  // List (with pagination)
  app.get(
    "/",
    list{ModuleName}sSchema,
    routeAdapter(
      new List{ModuleName}sController({
        list{ModuleName}sUseCase: new List{ModuleName}sPaginatedUseCase({
          {moduleName}Repository: new Mongo{ModuleName}Repository(),
        }),
      }),
    ),
  );

  // Find by ID
  app.get(
    "/:id",
    find{ModuleName}Schema,
    routeAdapter(
      new Find{ModuleName}Controller({
        find{ModuleName}UseCase: new Find{ModuleName}ByIdUseCase({
          {moduleName}Repository: new Mongo{ModuleName}Repository(),
        }),
      }),
    ),
  );

  // Update
  app.put(
    "/:id",
    update{ModuleName}Schema,
    routeAdapter(
      new Update{ModuleName}Controller({
        update{ModuleName}UseCase: new Update{ModuleName}UseCase({
          {moduleName}Repository: new Mongo{ModuleName}Repository(),
        }),
      }),
    ),
  );

  // Delete
  app.delete(
    "/:id",
    delete{ModuleName}Schema,
    routeAdapter(
      new Delete{ModuleName}Controller({
        delete{ModuleName}UseCase: new Delete{ModuleName}ByIdUseCase({
          {moduleName}Repository: new Mongo{ModuleName}Repository(),
        }),
      }),
    ),
  );
};

export { {moduleName}Routes };
```

## Module Registration

### 1. Main Routes File

Update `src/modules/routes.ts`:

```typescript
import { FastifyTypedInstance } from "@src/shared/types/fastifyTypedInstance";
import { userRoutes } from "@modules/user/user.routes";
import { {moduleName}Routes } from "@modules/{moduleName}/{moduleName}.routes";

const routes = (app: FastifyTypedInstance) => {
  app.register(userRoutes, { prefix: "/user" });
  app.register({moduleName}Routes, { prefix: "/{moduleName}" });
};

export { routes };
```

## Entity Definition

Create the entity in `src/shared/entities/{moduleName}.entity.ts`:

```typescript
export interface {ModuleName} {
  id?: string;
  // Define entity fields based on domain requirements
  name: string;
  email?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

## Module Dependencies

### Internal Dependencies

- Shared classes (AbstractController, IUseCase, CustomError)
- Shared types (HTTP, translation, pagination)
- Shared utilities (routeAdapter, validation)

### External Dependencies

- Repository implementations from infra layer
- Database entities from shared layer

## Design Principles

### 1. Domain-Driven Design

- Each module represents a bounded context
- Keep domain logic within the module
- Use ubiquitous language for naming

### 2. Dependency Inversion

- Depend on abstractions (interfaces), not implementations
- Inject dependencies through constructors
- Keep modules loosely coupled

### 3. Single Responsibility

- Each module handles one domain area
- Each file has a single responsibility
- Separate concerns (validation, business logic, data access)

### 4. Consistency

- Follow the same patterns across all modules
- Use consistent naming conventions
- Maintain similar file structures

## Common Module Types

### 1. Entity Modules (CRUD)

- User, Product, Order, etc.
- Full CRUD operations
- Standard REST endpoints

### 2. Service Modules

- Authentication, Notification, etc.
- Business service operations
- Custom endpoints

### 3. Aggregate Modules

- Complex domains with multiple entities
- Aggregate root pattern
- Domain-specific operations

## Testing Strategy

### 1. Unit Tests

- Test each layer independently
- Mock external dependencies
- Focus on business logic

### 2. Integration Tests

- Test module as a whole
- Use test database
- Verify end-to-end flows

### 3. E2E Tests

- Test through HTTP endpoints
- Use test environment
- Verify user scenarios

## File Organization Tips

### 1. Consistent Naming

- Use PascalCase for classes and interfaces
- Use camelCase for variables and functions
- Use kebab-case for file names (optional)

### 2. Logical Grouping

- Group related functionality together
- Separate by layer (controllers, use cases, etc.)
- Keep public interfaces visible

### 3. Dependency Management

- Import from closest scope first
- Use path aliases for cleaner imports
- Group imports logically

## Module Checklist

When creating a new module, ensure you have:

- [ ] Entity definition in shared/entities
- [ ] Repository interface in module/types
- [ ] Repository implementation in infra/mongo/repositories
- [ ] Request/Response models
- [ ] Validation schemas with OpenAPI docs
- [ ] Controllers for each operation
- [ ] Use cases for each operation
- [ ] Translation interface and implementations
- [ ] Route definitions with dependency injection
- [ ] Module registration in main routes
- [ ] Unit tests for all layers
- [ ] Integration tests for the module

## Security Considerations

### 1. Input Validation

- Validate all inputs at schema level
- Sanitize user data
- Use type-safe models

### 2. Authorization

- Implement role-based access control
- Validate user permissions
- Protect sensitive operations

### 3. Data Protection

- Exclude sensitive fields from responses
- Hash passwords and tokens
- Implement audit logging

## Performance Considerations

### 1. Database Queries

- Use indexes for frequent queries
- Implement pagination for large datasets
- Consider query optimization

### 2. Caching

- Cache frequently accessed data
- Use appropriate cache strategies
- Consider cache invalidation

### 3. Resource Management

- Limit payload sizes
- Implement rate limiting
- Monitor memory usage
