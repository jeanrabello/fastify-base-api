# Models Development Guide

## Overview

Models define the structure of data transfer objects (DTOs) used throughout the application. They ensure type safety for data flowing between different layers and provide clear contracts for API inputs and outputs.

## Model Categories

### 1. Request Models

Define the structure of incoming data from HTTP requests.

### 2. Response Models

Define the structure of outgoing data in HTTP responses.

### 3. Parameter Models

Define the structure of URL parameters and query strings.

## Architecture Pattern

### Base Interface

All models extend the base `IModel` interface:

```typescript
import { IModel } from "@src/shared/classes/IModel";
```

### Request Models Structure

#### Create Request Template

```typescript
import { IModel } from "@src/shared/classes/IModel";

export interface Create{ModuleName}RequestModel extends IModel {
  // Required fields for creation
  name: string;
  email: string;
  // Optional fields with defaults
  status?: string;
  // Exclude auto-generated fields (id, createdAt, updatedAt)
}
```

#### Update Request Template

```typescript
import { IModel } from "@src/shared/classes/IModel";

export interface Update{ModuleName}RequestModel extends IModel {
  // All fields optional for partial updates
  name?: string;
  email?: string;
  status?: string;
  // Exclude id, createdAt, updatedAt
}
```

#### Parameter Models Template

```typescript
import { IModel } from "@src/shared/classes/IModel";

export interface {ModuleName}IdParamsModel extends IModel {
  id: string;
}

export interface List{ModuleName}sPaginatedParamsModel extends IPaginatedModel {
  // Query parameters for filtering
  status?: string;
  search?: string;
  // Pagination inherited from IPaginatedModel
  page?: number;
  size?: number;
}
```

### Response Models Structure

#### Single Entity Response Template

```typescript
import { IModel } from "@src/shared/classes/IModel";

export interface Find{ModuleName}ByIdResponseModel extends IModel {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  // Include all fields that should be returned to client
}
```

#### Paginated Response Template

```typescript
import { IPaginatedModel } from "@src/shared/classes/IPaginatedModel";

interface ContentDataType {
  id: string;
  name: string;
  email: string;
}

export interface List{ModuleName}sPaginatedResponseModel extends IPaginatedModel<ContentDataType> {}
```

#### Simple Response Template

```typescript
import { IModel } from "@src/shared/classes/IModel";

export interface Update{ModuleName}EmailResponseModel extends IModel {
  id: string;
  email: string;
  updatedAt: Date;
  // Only include fields relevant to the operation
}
```

## Design Principles

### 1. Type Safety

- Use TypeScript interfaces for compile-time checking
- Define explicit types for all fields
- Avoid `any` type usage

### 2. Data Isolation

- Request models should not include computed fields
- Response models should not include sensitive data
- Parameter models should focus on routing/filtering needs

### 3. Consistency

- Use consistent naming conventions
- Follow the same structure patterns
- Maintain similar field types across modules

### 4. Separation of Concerns

- Request models for input validation
- Response models for output formatting
- Parameter models for URL/query handling

## Field Type Guidelines

### Common Field Types

```typescript
// Identity
id: string;

// Text fields
name: string;
description?: string; // Optional with ?

// Email validation (handled at schema level)
email: string;

// Enumerated values
status: 'active' | 'inactive' | 'pending';

// Dates
createdAt: Date;
updatedAt: Date;

// Numbers
age: number;
price: number;

// Booleans
isActive: boolean;
isVerified: boolean;

// Arrays
tags: string[];
categories: Category[];

// Nested objects
address: {
  street: string;
  city: string;
  country: string;
};
```

### Optional vs Required Fields

#### Request Models

```typescript
// Required for creation
export interface CreateUserRequestModel extends IModel {
  username: string; // Required
  email: string; // Required
  password: string; // Required
  firstName?: string; // Optional
  lastName?: string; // Optional
}

// All optional for updates
export interface UpdateUserRequestModel extends IModel {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  // Never include password in update model (separate endpoint)
}
```

#### Response Models

```typescript
// All fields present in response
export interface UserResponseModel extends IModel {
  id: string; // Always present
  username: string; // Always present
  email: string; // Always present
  firstName?: string; // Might be null/undefined
  lastName?: string; // Might be null/undefined
  createdAt: Date; // Always present
  updatedAt: Date; // Always present
  // Never include password or sensitive data
}
```

## Real-World Examples

### User Module Models

#### Request Models

```typescript
// CreateUserRequest.model.ts
import { IModel } from "@src/shared/classes/IModel";

export interface CreateUserRequestModel extends IModel {
  username: string;
  email: string;
  password: string;
}

// UpdateUserEmailRequest.model.ts
import { IModel } from "@src/shared/classes/IModel";

export interface UpdateUserEmailRequestModel extends IModel {
  email: string;
}
```

#### Parameter Models

```typescript
// UserIdParams.model.ts
import { IModel } from "@src/shared/classes/IModel";

export interface UserIdParamsModel extends IModel {
  id: string;
}

// ListUsersPaginatedParams.model.ts
import { IModel } from "@src/shared/classes/IModel";

export interface ListUsersPaginatedParamsModel extends IModel {
  page?: number;
  size?: number;
}
```

#### Response Models

```typescript
// FindUserByIdResponse.model.ts
import { IModel } from "@src/shared/classes/IModel";

export interface FindUserByIdResponseModel extends IModel {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ListUsersPaginatedResponse.model.ts
import { IPaginatedModel } from "@src/shared/classes/IPaginatedModel";
import { User } from "@src/shared/entities/user.entity";

export interface ListUsersPaginatedResponseModel
  extends IPaginatedModel<{
    id: string;
    username: string;
    email: string;
    createdAt: Date;
  }> {}
```

## Naming Conventions

### File Names

- Request: `{Action}{ModuleName}Request.model.ts`
- Response: `{Action}{ModuleName}Response.model.ts`
- Parameters: `{ModuleName}IdParams.model.ts`, `List{ModuleName}sPaginatedParams.model.ts`

### Interface Names

- Request: `{Action}{ModuleName}RequestModel`
- Response: `{Action}{ModuleName}ResponseModel`
- Parameters: `{ModuleName}IdParamsModel`, `List{ModuleName}sPaginatedParamsModel`

### Examples

```typescript
// Good naming
CreateUserRequestModel;
UpdateUserEmailRequestModel;
FindUserByIdResponseModel;
UserIdParamsModel;
ListUsersPaginatedParamsModel;

// Avoid
UserCreateRequest; // Inconsistent order
UserModel; // Too generic
CreateRequest; // Missing module context
```

## Validation Integration

Models work with validation schemas:

```typescript
// Model defines the structure
export interface CreateUserRequestModel extends IModel {
  username: string;
  email: string;
  password: string;
}

// Schema defines the validation rules
const createUserSchema = {
  schema: {
    body: z.object({
      username: z.string().min(3).max(20),
      email: z.string().email(),
      password: z.string().min(8).max(16),
    }),
  },
};
```

## File Organization

```
src/modules/{moduleName}/models/
├── Request/
│   ├── Create{ModuleName}Request.model.ts
│   ├── Update{ModuleName}Request.model.ts
│   ├── {ModuleName}IdParams.model.ts
│   └── List{ModuleName}sPaginatedParams.model.ts
└── Response/
    ├── Create{ModuleName}Response.model.ts
    ├── Find{ModuleName}ByIdResponse.model.ts
    ├── Update{ModuleName}Response.model.ts
    └── List{ModuleName}sPaginatedResponse.model.ts
```

## Best Practices

### 1. Security

- Never include sensitive fields in response models
- Use separate models for different operations
- Validate all input through schemas

### 2. Maintainability

- Keep models simple and focused
- Use composition over complex inheritance
- Document complex field relationships

### 3. Performance

- Only include necessary fields in responses
- Use partial types for optional data
- Consider payload size for large datasets

### 4. Testing

- Create mock data for each model
- Test model transformations
- Verify field presence/absence

## Common Patterns

### 1. Inheritance Hierarchy

```typescript
// Base model with common fields
interface BaseEntityModel extends IModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Specific models extend base
interface UserResponseModel extends BaseEntityModel {
  username: string;
  email: string;
}
```

### 2. Composition

```typescript
// Reusable components
interface ContactInfo {
  email: string;
  phone?: string;
}

interface Address {
  street: string;
  city: string;
  country: string;
}

// Composed model
interface UserProfileModel extends IModel {
  id: string;
  name: string;
  contact: ContactInfo;
  address?: Address;
}
```

### 3. Generic Models

```typescript
// Generic pagination response
interface PaginatedResponse<T> extends IModel {
  items: T[];
  pagination: PaginationMetadata;
}

// Usage
type UserListResponse = PaginatedResponse<UserResponseModel>;
type ProductListResponse = PaginatedResponse<ProductResponseModel>;
```

## Error Handling

Models should be designed to prevent common errors:

```typescript
// Avoid undefined behavior
interface CreateUserRequestModel extends IModel {
  username: string; // Required field
  email: string; // Required field
  firstName?: string; // Explicitly optional
}

// Use discriminated unions for state
interface UserModel extends IModel {
  id: string;
  status: "active" | "inactive" | "suspended";
  // Additional fields based on status
}
```
