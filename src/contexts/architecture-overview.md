# Architecture Overview and Development Guide

## Introduction

This document provides a comprehensive overview of the Fastify-based API architecture and development patterns. It serves as the master reference for understanding how all components work together in this clean architecture implementation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Controllers → Schemas → Routes → Middleware                │
│  • HTTP Request/Response handling                           │
│  • Input validation and sanitization                        │
│  • Authentication and authorization                         │
│  • Response formatting and translation                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Business Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Use Cases → Entities → Business Logic                      │
│  • Domain business rules                                    │
│  • Use case orchestration                                   │
│  • Business validation                                      │
│  • Error handling with translations                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Repositories → Database → External Services                │
│  • Data persistence and retrieval                           │
│  • Database abstraction                                     │
│  • External API integration                                 │
│  • Data mapping and transformation                          │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Modules (Domain Organization)

**Purpose**: Self-contained feature packages that encapsulate all related functionality.

**Structure**:

```
src/modules/{moduleName}/
├── {moduleName}.routes.ts      # Route definitions and DI
├── controllers/                # HTTP handlers
├── useCases/                  # Business logic
├── models/                    # Data transfer objects
├── schemas/                   # Validation and OpenAPI
├── types/                     # Interfaces and type definitions
└── lang/                      # Internationalization
```

**Key Principles**:

- Each module represents a bounded context
- Self-contained with minimal external dependencies
- Consistent structure across all modules
- Clear separation of concerns

### 2. Controllers (HTTP Layer)

**Purpose**: Handle HTTP requests and responses, delegate to use cases.

**Pattern**:

```typescript
export class {Action}{ModuleName}Controller extends AbstractController<
  I{ModuleName}Translation,
  {RequestModel}
> {
  constructor(dependencies: I{Action}{ModuleName}Controller) {
    super();
    this.{actionName}UseCase = dependencies.{actionName}UseCase;
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const result = await this.{actionName}UseCase.execute(request.body);
    return {
      statusCode: 201,
      message: "{module}.{action}.success",
      data: result,
    };
  }
}
```

**Responsibilities**:

- HTTP request/response handling
- Data extraction from requests
- Response formatting
- Error delegation to middleware

### 3. Use Cases (Business Logic)

**Purpose**: Implement business rules and coordinate between repositories.

**Pattern**:

```typescript
export class {Action}{ModuleName}UseCase implements IUseCase {
  constructor({ {moduleName}Repository }: I{Action}{ModuleName}UseCase) {
    this.{moduleName}Repository = {moduleName}Repository;
  }

  async execute(input: {InputModel}): Promise<{OutputType}> {
    // 1. Input validation
    // 2. Business logic validation
    // 3. Repository operations
    // 4. Return result
  }
}
```

**Responsibilities**:

- Business rule enforcement
- Input validation
- Repository coordination
- Error handling with CustomError

### 4. Repositories (Data Access)

**Purpose**: Abstract data persistence and provide clean interfaces for data operations.

**Pattern**:

```typescript
export class Mongo{ModuleName}Repository
  extends AbstractMongoRepository
  implements I{ModuleName}Repository {

  async save(data: Create{Entity}RequestModel): Promise<Partial<{Entity}> | null> {
    // Transform, save, and map response
  }
}
```

**Responsibilities**:

- Data persistence and retrieval
- Database abstraction
- Data mapping between layers
- Query optimization

### 5. Models (Data Transfer Objects)

**Purpose**: Define structure for data flowing between layers.

**Categories**:

- **Request Models**: Input validation and structure
- **Response Models**: Output formatting and structure
- **Parameter Models**: URL and query parameter structure

**Pattern**:

```typescript
// Request
export interface Create{ModuleName}RequestModel extends IModel {
  requiredField: string;
  optionalField?: string;
}

// Response
export interface {ModuleName}ResponseModel extends IModel {
  id: string;
  // All response fields
  createdAt: Date;
}
```

### 6. Schemas (Validation & Documentation)

**Purpose**: Define validation rules and OpenAPI documentation.

**Pattern**:

```typescript
const {action}{ModuleName}Schema = {
  schema: {
    tags: ["{ModuleName}s"],
    description: "Action description",
    body: z.object({
      field: z.string().min(1).max(100),
    }),
    response: {
      201: z.object({
        statusCode: z.number().default(201),
        message: z.string(),
        data: z.object({ /* response structure */ }),
      }),
    },
  },
};
```

**Responsibilities**:

- Input validation with Zod
- OpenAPI documentation generation
- Type safety for requests/responses

### 7. Translations (Internationalization)

**Purpose**: Provide type-safe, multi-language support for all user-facing messages.

**Pattern**:

```typescript
export interface I{ModuleName}Translation extends Translation {
  {moduleName}: {
    {action}: {
      success: string;
      error: string;
      specificMessage: string;
    };
  };
}
```

**Features**:

- Type-safe translation keys
- Multiple language support
- Hierarchical message organization
- Automatic language detection

### 8. Error Handling (Consistency)

**Purpose**: Provide consistent, translatable error handling across the application.

**Pattern**:

```typescript
// In use cases
throw new CustomError<I{ModuleName}Translation>(
  "{moduleName}.{action}.specificError",
  409
);

// Middleware handles translation and response
```

**Features**:

- Type-safe error messages
- HTTP status code integration
- Automatic translation
- Structured error responses

## Data Flow

### Request Flow

```
1. HTTP Request → Route Handler
2. Route Handler → Schema Validation
3. Schema Validation → Controller
4. Controller → Use Case
5. Use Case → Repository
6. Repository → Database
```

### Response Flow

```
1. Database → Repository (data mapping)
2. Repository → Use Case (business logic)
3. Use Case → Controller (result)
4. Controller → Response Translator (i18n)
5. Response Translator → HTTP Response
```

### Error Flow

```
1. Error occurs in any layer
2. CustomError thrown with translation key
3. Error Handler Middleware catches error
4. Translation applied based on Accept-Language
5. Structured error response returned
```

## Development Workflow

### Creating a New Module

1. **Define Entity** (`src/shared/entities/{entity}.entity.ts`)

```typescript
export interface {Entity} {
  id?: string;
  // Business fields
  createdAt?: Date;
  updatedAt?: Date;
}
```

2. **Create Repository Interface** (`src/modules/{module}/types/I{Module}Repository.ts`)

```typescript
export interface I{Module}Repository {
  save(data: Create{Entity}RequestModel): Promise<Partial<{Entity}> | null>;
  findById(id: string): Promise<Partial<{Entity}> | null>;
  // CRUD methods
}
```

3. **Implement Repository** (`src/infra/mongo/repositories/{module}/Mongo{Module}Repository.ts`)

```typescript
export class Mongo{Module}Repository
  extends AbstractMongoRepository
  implements I{Module}Repository {
  // Implementation
}
```

4. **Create Models** (`src/modules/{module}/models/`)

- Request models for input
- Response models for output
- Parameter models for URLs

5. **Create Schemas** (`src/modules/{module}/schemas/`)

- Validation rules with Zod
- OpenAPI documentation

6. **Create Use Cases** (`src/modules/{module}/useCases/`)

- Business logic implementation
- Repository coordination

7. **Create Controllers** (`src/modules/{module}/controllers/`)

- HTTP request handling
- Use case delegation

8. **Create Translations** (`src/modules/{module}/lang/`)

- Translation interface
- Language implementations

9. **Create Routes** (`src/modules/{module}/{module}.routes.ts`)

- Route definitions
- Dependency injection

10. **Register Module** (`src/modules/routes.ts`)

```typescript
app.register({module}Routes, { prefix: "/{module}" });
```

## Dependency Injection Pattern

### Constructor Injection

```typescript
// Controllers
constructor(dependencies: ICreateUserController) {
  super();
  this.createUserUseCase = dependencies.createUserUseCase;
}

// Use Cases
constructor({ userRepository }: ICreateUserUseCase) {
  this.userRepository = userRepository;
}
```

### Route-Level DI

```typescript
app.post(
  "/",
  createUserSchema,
  routeAdapter(
    new CreateUserController({
      createUserUseCase: new CreateUserUseCase({
        userRepository: new MongoUserRepository(),
      }),
    }),
  ),
);
```

## Type Safety Features

### Generic Controllers

```typescript
export class CreateUserController extends AbstractController<
  IUserTranslation, // Translation interface
  CreateUserRequestModel // Request body type
> {
  // Type-safe request and response handling
}
```

### Type-Safe Errors

```typescript
throw new CustomError<IUserTranslation>(
  "user.createUser.emailAlreadyRegistered", // Validated translation key
  409,
);
```

### Schema Integration

```typescript
// Schema defines validation
body: z.object({
  email: z.string().email(),
}),

// Model provides type
interface CreateUserRequestModel {
  email: string;
}
```

## Testing Strategy

### Unit Tests

- **Controllers**: Mock use cases, test HTTP logic
- **Use Cases**: Mock repositories, test business logic
- **Repositories**: Test data operations with test database

### Integration Tests

- **Module Level**: Test complete module functionality
- **Database**: Test with actual database operations
- **API**: Test HTTP endpoints end-to-end

### E2E Tests

- **User Scenarios**: Test complete user workflows
- **Error Scenarios**: Test error handling paths
- **Performance**: Test under load conditions

## Security Considerations

### Input Validation

- Schema-level validation with Zod
- Type-safe request models
- Sanitization of user input

### Data Protection

- Exclude sensitive fields from responses
- Hash passwords and tokens
- Encrypt PII data at rest

### Error Handling

- Generic error messages to prevent information disclosure
- Detailed logging for debugging
- Rate limiting for error-prone endpoints

## Performance Optimizations

### Database

- Proper indexing strategies
- Efficient query patterns
- Connection pooling

### Caching

- Response caching for read-heavy operations
- Database query result caching
- Translation caching

### Monitoring

- Performance metrics collection
- Error rate monitoring
- Resource usage tracking

## Best Practices Summary

### Code Organization

- Follow consistent naming conventions
- Use dependency injection throughout
- Keep modules self-contained
- Separate concerns clearly

### Error Handling

- Use CustomError for all business errors
- Provide meaningful error messages
- Log errors with sufficient context
- Handle errors at appropriate levels

### Type Safety

- Use TypeScript strictly
- Define clear interfaces
- Avoid `any` type usage
- Leverage generic types

### Testing

- Write tests for all layers
- Use dependency injection for mocking
- Test error scenarios
- Maintain good test coverage

### Documentation

- Keep documentation current
- Provide clear examples
- Document complex business rules
- Use meaningful commit messages

This architecture provides a solid foundation for building scalable, maintainable APIs with clear separation of concerns, type safety, and comprehensive error handling.
