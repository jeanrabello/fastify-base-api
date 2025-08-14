# LLM Development Contexts - Complete Guide

## Overview

This folder contains comprehensive development guides for LLMs to understand and follow the established patterns in this Fastify-based API project. Each document provides detailed instructions, templates, and examples for creating consistent, maintainable code.

## Available Context Documents

### 1. **architecture-overview.md**

**Purpose**: Master reference document that explains the overall system architecture and how all components work together.

**Key Topics**:

- Clean architecture layers (Presentation, Business, Data Access)
- Component relationships and data flow
- Development workflow for new modules
- Dependency injection patterns
- Type safety features
- Testing strategies

**When to Use**: Start here for understanding the big picture before diving into specific components.

---

### 2. **controllers.md**

**Purpose**: Guide for creating HTTP request/response handlers that delegate to use cases.

**Key Topics**:

- AbstractController extension pattern
- Generic type usage for translations and request models
- Dependency injection through constructor
- Response structure and status codes
- Error handling delegation

**Template Example**:

```typescript
export class {Action}{ModuleName}Controller extends AbstractController<
  I{ModuleName}Translation,
  {RequestModel}
>
```

**When to Use**: Creating new controllers or understanding how HTTP requests are handled.

---

### 3. **useCases.md**

**Purpose**: Guide for implementing business logic that coordinates between repositories.

**Key Topics**:

- IUseCase interface implementation
- Input validation patterns
- Business rule enforcement
- Repository coordination
- CustomError usage for business errors

**Template Example**:

```typescript
export class {Action}{ModuleName}UseCase implements IUseCase {
  async execute(input: {InputModel}): Promise<{OutputType}>
}
```

**When to Use**: Implementing business logic, creating new use cases, or understanding business layer patterns.

---

### 4. **repositories.md**

**Purpose**: Guide for creating data access layers that abstract database operations.

**Key Topics**:

- AbstractMongoRepository extension
- Interface implementation pattern
- Data mapping between database and domain models
- CRUD operation patterns
- Pagination implementation
- MongoDB best practices

**Template Example**:

```typescript
export class Mongo{ModuleName}Repository
  extends AbstractMongoRepository
  implements I{ModuleName}Repository
```

**When to Use**: Creating new repositories, implementing data access patterns, or working with database operations.

---

### 5. **models.md**

**Purpose**: Guide for creating data transfer objects (DTOs) that define data structure between layers.

**Key Topics**:

- Request/Response/Parameter model categories
- IModel interface extension
- Field type guidelines (required vs optional)
- Naming conventions
- Security considerations for sensitive data

**Template Example**:

```typescript
export interface Create{ModuleName}RequestModel extends IModel {
  requiredField: string;
  optionalField?: string;
}
```

**When to Use**: Defining data structures for API inputs/outputs, creating type-safe interfaces.

---

### 6. **schemas.md**

**Purpose**: Guide for creating validation rules and OpenAPI documentation using Zod.

**Key Topics**:

- Fastify schema structure with Zod
- Validation patterns for different data types
- Response schema definition
- OpenAPI documentation generation
- Error response structures

**Template Example**:

```typescript
const {action}{ModuleName}Schema = {
  schema: {
    tags: ["{ModuleName}s"],
    body: z.object({ /* validation rules */ }),
    response: { /* response schemas */ }
  }
};
```

**When to Use**: Adding validation to endpoints, creating OpenAPI documentation, defining API contracts.

---

### 7. **translations.md**

**Purpose**: Guide for implementing type-safe internationalization (i18n) support.

**Key Topics**:

- Translation interface hierarchical structure
- Multiple language implementation
- Type-safe translation keys
- Integration with error handling
- Message organization patterns

**Template Example**:

```typescript
export interface I{ModuleName}Translation extends Translation {
  {moduleName}: {
    {action}: {
      success: string;
      error: string;
    };
  };
}
```

**When to Use**: Adding new modules with i18n support, creating error messages, implementing multi-language features.

---

### 8. **entities.md**

**Purpose**: Guide for defining domain entities that represent core business objects.

**Key Topics**:

- Entity interface structure
- Field type patterns and naming
- Relationship modeling (one-to-many, many-to-many)
- Security considerations for sensitive data
- Database integration patterns

**Template Example**:

```typescript
export interface {EntityName} {
  id?: string;
  // Business fields
  createdAt?: Date;
  updatedAt?: Date;
}
```

**When to Use**: Defining new business entities, modeling domain objects, setting up database schemas.

---

### 9. **error-handling.md**

**Purpose**: Guide for implementing consistent, translatable error handling across the application.

**Key Topics**:

- CustomError class usage
- HTTP status code patterns
- Translation integration
- Error logging and monitoring
- Security considerations for error messages

**Template Example**:

```typescript
throw new CustomError<I{ModuleName}Translation>(
  "{moduleName}.{action}.specificError",
  409
);
```

**When to Use**: Implementing error handling, creating business logic validations, debugging error flows.

---

### 10. **modules.md**

**Purpose**: Guide for creating self-contained feature modules that encapsulate all related functionality.

**Key Topics**:

- Module structure and organization
- File naming conventions
- Route registration patterns
- Dependency injection setup
- Module checklist for completeness

**Template Structure**:

```
src/modules/{moduleName}/
├── {moduleName}.routes.ts
├── controllers/
├── useCases/
├── models/
├── schemas/
├── types/
└── lang/
```

**When to Use**: Creating new feature modules, understanding project organization, setting up new domains.

---

## Development Workflow Using These Contexts

### For New Module Development:

1. **Start with**: `architecture-overview.md` - Understand the big picture
2. **Define domain**: `entities.md` - Create business entities
3. **Plan structure**: `modules.md` - Set up module organization
4. **Create data contracts**: `models.md` - Define DTOs
5. **Add validation**: `schemas.md` - Create validation rules
6. **Implement data access**: `repositories.md` - Create repositories
7. **Add business logic**: `useCases.md` - Implement use cases
8. **Create HTTP layer**: `controllers.md` - Handle requests
9. **Add i18n support**: `translations.md` - Implement translations
10. **Handle errors**: `error-handling.md` - Add error handling

### For Understanding Existing Code:

- **HTTP layer**: `controllers.md` + `schemas.md`
- **Business layer**: `useCases.md` + `entities.md`
- **Data layer**: `repositories.md` + `models.md`
- **Cross-cutting**: `translations.md` + `error-handling.md`

### For Debugging Issues:

- **Validation errors**: `schemas.md`
- **Business logic errors**: `useCases.md` + `error-handling.md`
- **Data access issues**: `repositories.md`
- **Translation problems**: `translations.md`

## Key Principles Across All Contexts

### 1. **Type Safety**

- Use TypeScript strictly throughout
- Define clear interfaces for all components
- Leverage generic types for reusability

### 2. **Dependency Injection**

- Use constructor injection for all dependencies
- Program against interfaces, not implementations
- Make components easily testable

### 3. **Separation of Concerns**

- Each layer has clear responsibilities
- Avoid mixing business logic with HTTP concerns
- Keep data access separate from business rules

### 4. **Consistency**

- Follow established naming conventions
- Use consistent patterns across modules
- Maintain similar file structures

### 5. **Error Handling**

- Use CustomError for all business errors
- Provide meaningful, translatable error messages
- Handle errors at appropriate levels

### 6. **Internationalization**

- All user-facing messages support i18n
- Use type-safe translation keys
- Organize messages hierarchically

## Quick Reference Commands

### Generate New Module (Checklist):

```bash
# 1. Create entity: src/shared/entities/{entity}.entity.ts
# 2. Create module structure: src/modules/{module}/
# 3. Create repository interface: src/modules/{module}/types/I{Module}Repository.ts
# 4. Implement repository: src/infra/mongo/repositories/{module}/
# 5. Create models: src/modules/{module}/models/
# 6. Create schemas: src/modules/{module}/schemas/
# 7. Create use cases: src/modules/{module}/useCases/
# 8. Create controllers: src/modules/{module}/controllers/
# 9. Create translations: src/modules/{module}/lang/
# 10. Create routes: src/modules/{module}/{module}.routes.ts
# 11. Register in: src/modules/routes.ts
```

## Support and Maintenance

These context documents should be:

- **Updated** when architectural patterns change
- **Reviewed** regularly for accuracy and completeness
- **Extended** when new patterns emerge
- **Referenced** during code reviews

The goal is to maintain consistency and enable any LLM to quickly understand and contribute to the codebase following established patterns and best practices.
