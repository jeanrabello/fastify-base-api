# Repositories Development Guide

## Overview

Repositories handle data persistence and retrieval. They implement the Repository pattern, abstracting database operations from business logic. All repositories extend `AbstractMongoRepository` and implement module-specific interfaces.

## Architecture Pattern

### Base Structure

All repositories extend the `AbstractMongoRepository`:

```typescript
import { AbstractMongoRepository } from "@src/infra/mongo/repositories/AbstractMongoRepository";
```

### Repository Interface Template

```typescript
export interface I{ModuleName}Repository {
  save(new{Entity}: Create{Entity}RequestModel): Promise<Partial<{Entity}> | null>;
  findById(id: string): Promise<Partial<{Entity}> | null>;
  findByEmail(email: string): Promise<Partial<{Entity}> | null>; // if applicable
  delete(id: string): Promise<boolean>;
  update(id: string, data: Partial<{Entity}>): Promise<Partial<{Entity}> | null>;
  findPaginated(params: PaginationParams): Promise<PaginatedResult<Partial<{Entity}>>>;
  // Add other domain-specific methods as needed
}
```

### Repository Implementation Template

```typescript
import { I{ModuleName}Repository } from "@modules/{moduleName}/types/I{ModuleName}Repository";
import { {Entity} } from "@src/shared/entities/{entity}.entity";
import { ObjectId } from "mongodb";
import { AbstractMongoRepository } from "../AbstractMongoRepository";
import { PaginationParams, PaginatedResult } from "@src/shared/types/pagination";

export class Mongo{ModuleName}Repository
  extends AbstractMongoRepository
  implements I{ModuleName}Repository
{
  private collectionName = "{entities}"; // plural form

  async save(new{Entity}: Create{Entity}RequestModel): Promise<Partial<{Entity}> | null> {
    const newDocument = {
      // Map request model to database document
      field1: new{Entity}.field1,
      field2: new{Entity}.field2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db
      .collection(this.collectionName)
      .insertOne(newDocument);

    return {
      id: result.insertedId.toString(),
      // Return relevant fields (exclude sensitive data)
      field1: new{Entity}.field1,
      field2: new{Entity}.field2,
    };
  }

  async findById(id: string): Promise<Partial<{Entity}> | null> {
    const entity = await this.db
      .collection<{Entity}>(this.collectionName)
      .findOne({ _id: new ObjectId(id) });

    if (!entity) return null;

    return this.mapToResponse(entity);
  }

  async findByEmail(email: string): Promise<Partial<{Entity}> | null> {
    const entity = await this.db
      .collection<{Entity}>(this.collectionName)
      .findOne({ email });

    if (!entity) return null;

    return this.mapToResponse(entity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .collection<{Entity}>(this.collectionName)
      .deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount > 0;
  }

  async update(id: string, data: Partial<{Entity}>): Promise<Partial<{Entity}> | null> {
    const updateDocument = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await this.db
      .collection<{Entity}>(this.collectionName)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDocument },
        { returnDocument: 'after' }
      );

    if (!result.value) return null;

    return this.mapToResponse(result.value);
  }

  async findPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<Partial<{Entity}>>> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const size = params.size && params.size > 0 ? params.size : 10;
    const skip = (page - 1) * size;

    const collection = this.db.collection<{Entity}>(this.collectionName);
    const totalItems = await collection.countDocuments();
    const cursor = collection.find().skip(skip).limit(size);
    const docs = await cursor.toArray();

    const items = docs.map(doc => this.mapToResponse(doc));
    const totalPages = Math.ceil(totalItems / size);

    return {
      items,
      pagination: {
        page,
        size,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  private mapToResponse(entity: {Entity}): Partial<{Entity}> {
    return {
      id: entity._id.toString(),
      field1: entity.field1,
      field2: entity.field2,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      // Exclude sensitive fields like passwords
    };
  }
}
```

## Key Principles

### 1. Interface Segregation

- Define repository interfaces in the module's types folder
- Keep interfaces focused on specific domain needs
- Don't expose unnecessary database details

### 2. Data Mapping

- Always map between database documents and domain entities
- Exclude sensitive data (passwords, tokens) from responses
- Convert MongoDB ObjectId to string for external consumption

### 3. Error Handling

- Let MongoDB errors bubble up to be handled by use cases
- Return null for not found scenarios
- Return boolean for delete operations

### 4. Pagination

- Always implement pagination for list operations
- Use consistent pagination parameters
- Return metadata about pagination state

### 5. Database Abstraction

- Use the abstract base class for database connection
- Keep MongoDB-specific code within repository implementations
- Use TypeScript generics for type safety

## Common Repository Methods

### 1. Basic CRUD Operations

```typescript
// Create
async save(data: Create{Entity}RequestModel): Promise<Partial<{Entity}> | null>

// Read
async findById(id: string): Promise<Partial<{Entity}> | null>
async findPaginated(params: PaginationParams): Promise<PaginatedResult<Partial<{Entity}>>>

// Update
async update(id: string, data: Partial<{Entity}>): Promise<Partial<{Entity}> | null>

// Delete
async delete(id: string): Promise<boolean>
```

### 2. Domain-Specific Queries

```typescript
// Find by unique fields
async findByEmail(email: string): Promise<Partial<{Entity}> | null>
async findByUsername(username: string): Promise<Partial<{Entity}> | null>

// Complex queries
async findByStatus(status: string): Promise<Partial<{Entity}>[]>
async findCreatedBetween(startDate: Date, endDate: Date): Promise<Partial<{Entity}>[]>
```

### 3. Batch Operations

```typescript
async findByIds(ids: string[]): Promise<Partial<{Entity}>[]>
async updateMany(filter: object, update: object): Promise<number>
async deleteMany(filter: object): Promise<number>
```

## MongoDB Best Practices

### 1. Index Management

- Create indexes for frequently queried fields
- Consider compound indexes for complex queries
- Monitor query performance

### 2. Aggregation Pipelines

- Use aggregation for complex data processing
- Implement efficient counting for pagination
- Consider memory limits for large datasets

### 3. Transactions

- Use transactions for multi-collection operations
- Handle transaction failures gracefully
- Keep transactions short-lived

## Data Transformation

### 1. Input Mapping

```typescript
// Transform request models to database documents
const newDocument = {
  username: newUser.username,
  email: newUser.email.toLowerCase(), // normalize
  password: await hashPassword(newUser.password), // hash sensitive data
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### 2. Output Mapping

```typescript
// Transform database documents to response models
private mapToResponse(entity: User): Partial<User> {
  return {
    id: entity._id.toString(),
    username: entity.username,
    email: entity.email,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    // Explicitly exclude password and other sensitive fields
  };
}
```

## Naming Conventions

### File Names

- Interface: `I{ModuleName}Repository.ts`
- Implementation: `Mongo{ModuleName}Repository.ts`

### Class Names

- Interface: `I{ModuleName}Repository`
- Implementation: `Mongo{ModuleName}Repository`

### Collection Names

- Use plural form of entity name
- Use lowercase with underscores if needed
- Examples: `users`, `user_profiles`, `order_items`

## Testing Considerations

- Use in-memory MongoDB for integration tests
- Mock repositories for use case unit tests
- Test edge cases (empty results, large datasets)
- Verify data mapping correctness

## File Locations

- Interfaces: `src/modules/{moduleName}/types/I{ModuleName}Repository.ts`
- Implementations: `src/infra/mongo/repositories/{moduleName}/Mongo{ModuleName}Repository.ts`

## Security Considerations

### 1. Data Sanitization

- Validate input data before database operations
- Sanitize user input to prevent injection attacks
- Use parameterized queries when possible

### 2. Sensitive Data

- Never return passwords in API responses
- Hash passwords before storing
- Consider encrypting sensitive fields

### 3. Access Control

- Implement query filters based on user permissions
- Validate user ownership of resources
- Use database-level security when appropriate
