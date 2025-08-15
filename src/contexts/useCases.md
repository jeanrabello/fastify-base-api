# Use Cases Development Guide

## Overview

Use cases contain the business logic of the application and coordinate between different layers. They implement the `IUseCase` interface and follow the Single Responsibility Principle.

## Architecture Pattern

### Base Structure

All use cases must implement the `IUseCase` interface:

```typescript
import { IUseCase } from "@src/shared/classes/IUseCase";
```

### Use Case Template

```typescript
interface I{Action}{ModuleName}UseCase {
  {moduleName}Repository: I{ModuleName}Repository;
  // Add other repository dependencies as needed
}

export class {Action}{ModuleName}UseCase implements IUseCase {
  private {moduleName}Repository: I{ModuleName}Repository;

  constructor({ {moduleName}Repository }: I{Action}{ModuleName}UseCase) {
    this.{moduleName}Repository = {moduleName}Repository;
  }

  async execute(input: {InputModel}): Promise<{OutputType}> {
    // 1. Validate input
    if (!input || !input.requiredField) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    // 2. Business logic validation
    // Check business rules, existing data, etc.

    // 3. Repository operations
    const result = await this.{moduleName}Repository.someMethod(input);

    // 4. Additional business logic if needed

    // 5. Return result
    return result;
  }
}
```

## Key Principles

### 1. Single Responsibility

- Each use case should handle only one business operation
- Keep use cases focused and cohesive
- If a use case becomes too complex, consider splitting it

### 2. Input Validation

- Always validate required fields at the beginning
- Use `CustomError` for validation failures
- Provide meaningful error messages with translation keys

### 3. Business Logic

- Encapsulate business rules within use cases
- Validate business constraints (e.g., uniqueness, relationships)
- Handle complex orchestration between repositories

### 4. Error Handling

- Use `CustomError` with appropriate HTTP status codes
- Provide translation keys for error messages
- Use generic types for better type safety with translations

### 5. Repository Pattern

- Use dependency injection for repositories
- Program against interfaces, not concrete implementations
- Keep database concerns separate from business logic

## Error Handling Pattern

```typescript
// For shared errors
throw new CustomError("shared.error.requiredFields", 400);

// For module-specific errors with typed translations
throw new CustomError<I{ModuleName}Translation>(
  "{moduleName}.{action}.specificError",
  409
);
```

## Common Use Case Types

### 1. Create Operations

```typescript
export class Create{ModuleName}UseCase implements IUseCase {
  async execute(input: Create{ModuleName}RequestModel): Promise<Partial<{Entity}>> {
    // Validate required fields
    if (!input || !input.email || !input.password) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    // Check business rules (e.g., uniqueness)
    const exists = await this.repository.findByEmail(input.email);
    if (exists) {
      throw new CustomError("{module}.create{Entity}.emailAlreadyRegistered", 409);
    }

    // Create entity
    const entity = await this.repository.save(input);
    if (!entity) {
      throw new CustomError("{module}.create{Entity}.error", 500);
    }

    return entity;
  }
}
```

### 2. Find Operations

```typescript
export class Find{ModuleName}ByIdUseCase implements IUseCase {
  async execute(id: string): Promise<Partial<{Entity}>> {
    if (!id) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new CustomError("{module}.find{Entity}.notFound", 404);
    }

    return entity;
  }
}
```

### 3. List/Paginated Operations

```typescript
export class List{ModuleName}PaginatedUseCase implements IUseCase {
  async execute(params: PaginationParams): Promise<PaginatedResult<Partial<{Entity}>>> {
    return await this.repository.findPaginated(params);
  }
}
```

### 4. Update Operations

```typescript
export class Update{ModuleName}UseCase implements IUseCase {
  async execute(input: Update{ModuleName}RequestModel): Promise<Partial<{Entity}>> {
    // Validate input
    if (!input || !input.id) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    // Check if entity exists
    const exists = await this.repository.findById(input.id);
    if (!exists) {
      throw new CustomError("{module}.update{Entity}.notFound", 404);
    }

    // Business validation (e.g., for unique fields)
    if (input.email) {
      const emailExists = await this.repository.findByEmail(input.email);
      if (emailExists && emailExists.id !== input.id) {
        throw new CustomError("{module}.update{Entity}.emailAlreadyRegistered", 409);
      }
    }

    // Update entity
    const updated = await this.repository.update(input.id, input);
    if (!updated) {
      throw new CustomError("{module}.update{Entity}.error", 500);
    }

    return updated;
  }
}
```

### 5. Delete Operations

```typescript
export class Delete{ModuleName}ByIdUseCase implements IUseCase {
  async execute(id: string): Promise<boolean> {
    if (!id) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    const exists = await this.repository.findById(id);
    if (!exists) {
      throw new CustomError("{module}.delete{Entity}.notFound", 404);
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new CustomError("{module}.delete{Entity}.error", 500);
    }

    return deleted;
  }
}
```

## Naming Conventions

### File Names

- `{Action}{ModuleName}UseCase.ts`
- Examples: `CreateUserUseCase.ts`, `ListUsersPaginatedUseCase.ts`

### Class Names

- `{Action}{ModuleName}UseCase`
- Examples: `CreateUserUseCase`, `FindUserByIdUseCase`

### Interface Names

- `I{Action}{ModuleName}UseCase`
- Examples: `ICreateUserUseCase`, `IFindUserByIdUseCase`

## Testing Considerations

- Mock repository dependencies for unit testing
- Test all validation scenarios
- Test error handling paths
- Test successful execution paths
- Use dependency injection for easier testing

## File Location

Use cases should be placed in:
`src/modules/{moduleName}/useCases/{Action}{ModuleName}UseCase.ts`

## Dependencies

Use cases typically depend on:

- Repository interfaces for data access
- Other use cases for complex operations
- External services (email, file storage, etc.)
- Validation utilities
