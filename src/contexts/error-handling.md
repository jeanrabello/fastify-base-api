# Error Handling Development Guide

## Overview

The error handling system provides consistent, type-safe error management across the application. It uses the `CustomError` class for business logic errors and integrates with the translation system for internationalized error messages.

## Architecture Pattern

### CustomError Class

The `CustomError` class extends the native Error class and provides structured error handling:

```typescript
import { Translation } from "@src/shared/types/lang";
import { Paths } from "@src/shared/types/paths";

export default class CustomError<T extends Translation> extends Error {
  public statusCode: number;
  public translationPath: Paths<T>;

  constructor(translationPath: Paths<T>, statusCode?: number) {
    super(translationPath as string);
    this.statusCode = statusCode || 500;
    this.translationPath = translationPath;
    this.name = "CustomError";
  }
}
```

## Error Types and Status Codes

### Client Errors (4xx)

```typescript
// 400 Bad Request - Validation errors
throw new CustomError("shared.error.requiredFields", 400);
throw new CustomError("shared.error.invalidFields", 400);

// 401 Unauthorized - Authentication required
throw new CustomError("shared.error.tokenNotFound", 401);
throw new CustomError("shared.error.tokenExpired", 401);

// 403 Forbidden - Authorization failed
throw new CustomError("shared.error.accessForbidden", 403);

// 404 Not Found - Resource doesn't exist
throw new CustomError<IUserTranslation>("user.findUser.notFound", 404);

// 409 Conflict - Resource conflict
throw new CustomError<IUserTranslation>(
  "user.createUser.emailAlreadyRegistered",
  409,
);

// 422 Unprocessable Entity - Business logic error
throw new CustomError("shared.error.businessRuleViolation", 422);
```

### Server Errors (5xx)

```typescript
// 500 Internal Server Error - Unexpected errors
throw new CustomError<IUserTranslation>("user.createUser.error", 500);
throw new CustomError("shared.error.internalServerError", 500);

// 503 Service Unavailable - External service errors
throw new CustomError("shared.error.serviceUnavailable", 503);
```

## Usage Patterns

### In Use Cases

```typescript
export class CreateUserUseCase implements IUseCase {
  async execute(input: CreateUserRequestModel): Promise<Partial<User>> {
    // Input validation
    if (!input || !input.email || !input.password) {
      throw new CustomError("shared.error.requiredFields", 400);
    }

    // Business rule validation
    const exists = await this.userRepository.findByEmail(input.email);
    if (exists) {
      throw new CustomError<IUserTranslation>(
        "user.createUser.emailAlreadyRegistered",
        409,
      );
    }

    // Operation execution
    const user = await this.userRepository.save(input);
    if (!user) {
      throw new CustomError<IUserTranslation>("user.createUser.error", 500);
    }

    return user;
  }
}
```

### In Controllers

Controllers should let use case errors bubble up naturally, as the error handler middleware will catch and process them appropriately:

```typescript
export class CreateUserController extends AbstractController<IUserTranslation> {
  async handle(
    request: HttpRequest<CreateUserRequestModel>,
  ): Promise<HttpResponse> {
    const newUser = request.body as CreateUserRequestModel;
    const user = await this.createUserUseCase.execute(newUser);
    return {
      statusCode: 201,
      message: "user.createUser.created",
      data: user,
    };
  }
}
```

### In Repositories

Repositories should focus on data operations and let unexpected errors bubble up to be handled as internal server errors:

```typescript
export class MongoUserRepository implements IUserRepository {
  async save(newUser: CreateUserRequestModel): Promise<Partial<User> | null> {
    const newDocument = {
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.db
      .collection(this.collectionName)
      .insertOne(newDocument);
    return {
      id: result.insertedId.toString(),
      username: newUser.username,
      email: newUser.email,
    };
  }
}
```

## Error Handler Middleware

The error handler middleware catches and processes all errors:

```typescript
export default async function errorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request: FastifyRequest, reply: FastifyReply) => {
    // Handle validation errors (Zod)
    if (Array.isArray((error as any).validation)) {
      const issues = (error as any).validation as Array<{
        instancePath: string;
        message: string;
      }>;
      const campos = issues.map((i) => i.instancePath.replace(/^\//, ""));
      const fields = campos.length ? `'${campos.join("', '")}'` : "";
      return reply
        .status(400)
        .type("application/json")
        .send(
          JSON.stringify({ message: `shared.error.invalidFields: ${fields}` }),
        );
    }

    // Handle CustomError instances
    if (error instanceof CustomError) {
      return reply
        .status(error.statusCode)
        .type("application/json")
        .send(JSON.stringify({ message: error.message }));
    }

    // Handle unexpected errors
    return reply
      .status(500)
      .type("application/json")
      .send(JSON.stringify({ message: "shared.error.internalServerError" }));
  });
}
```

## Translation Integration

### Shared Error Messages

Define common error messages in the shared translation interface:

```typescript
export interface Translation {
  shared: {
    error: {
      invalidFields: string;
      requiredFields: string;
      tokenExpired: string;
      tokenNotFound: string;
      internalServerError: string;
      noMessageSpecified: string;
      accessForbidden: string;
      serviceUnavailable: string;
      businessRuleViolation: string;
    };
  };
}
```

### Module-Specific Error Messages

Define module-specific errors in module translation interfaces:

```typescript
export interface IUserTranslation extends Translation {
  user: {
    createUser: {
      created: string;
      error: string;
      emailAlreadyRegistered: string;
    };
    findUser: {
      notFound: string;
      found: string;
    };
    deleteUser: {
      deleted: string;
      notFound: string;
      error: string;
      cannotDelete: string;
    };
  };
}
```

## Error Response Structure

All error responses follow a consistent structure with a message field:

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

### Examples

#### Success Response

```json
{
  "statusCode": 201,
  "message": "User created successfully!",
  "data": {
    "id": "user123",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### Error Response

```json
{
  "statusCode": 409,
  "message": "Email already registered"
}
```

#### Validation Error Response

```json
{
  "message": "Invalid fields: 'email', 'password'"
}
```

## Common Error Scenarios

### Validation Errors

```typescript
// Use cases: Input validation
if (!input || !input.email) {
  throw new CustomError("shared.error.requiredFields", 400);
}

if (!isValidEmail(input.email)) {
  throw new CustomError("shared.error.invalidFields", 400);
}

// Schemas: Let Zod handle validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Business Logic Errors

```typescript
// Resource not found
const user = await this.userRepository.findById(id);
if (!user) {
  throw new CustomError<IUserTranslation>("user.findUser.notFound", 404);
}

// Business rule violation
if (user.status === "suspended") {
  throw new CustomError<IUserTranslation>("user.accountSuspended", 403);
}

// Resource conflict
const existingUser = await this.userRepository.findByEmail(email);
if (existingUser) {
  throw new CustomError<IUserTranslation>(
    "user.createUser.emailAlreadyRegistered",
    409,
  );
}
```

### External Service Errors

```typescript
// Database connection errors - let them bubble up as 500 errors
const user = await this.userRepository.save(userData);
if (!user) {
  throw new CustomError<IUserTranslation>("user.createUser.error", 500);
}

// External API errors - handle gracefully
try {
  await externalApiCall();
} catch (apiError) {
  throw new CustomError("shared.error.serviceUnavailable", 503);
}
```

## Testing Error Handling

### Unit Tests

```typescript
describe("CreateUserUseCase", () => {
  it("Should return error if user already exists", async () => {
    userRepository.findByEmail.mockResolvedValue(validCreateUserModel);
    await expect(useCase.execute(validCreateUserModel)).rejects.toEqual(
      new CustomError<IUserTranslation>(
        "user.createUser.emailAlreadyRegistered",
        409,
      ),
    );
  });

  it("Should return error if user not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute(validCreateUserModel)).rejects.toEqual(
      new CustomError<IUserTranslation>("user.createUser.error"),
    );
  });
});
```

## Best Practices

### 1. Consistent Error Handling

- Always use CustomError for business logic errors
- Use appropriate HTTP status codes
- Provide meaningful error messages

### 2. Error Classification

- 4xx errors: Client/user errors (validation, authentication, authorization)
- 5xx errors: Server/system errors (database, external services)

### 3. Security Considerations

- Don't expose sensitive information in error messages
- Log detailed errors server-side, return generic messages to clients
- Avoid error messages that aid attackers

### 4. Performance

- Don't use exceptions for control flow
- Catch and handle errors at appropriate levels (primarily in use cases)
- Let unexpected errors bubble up naturally

### 5. Consistency

- Always use CustomError for business logic errors
- Let the error handler middleware process all errors uniformly
- Maintain consistent error message structures

## Error Message Guidelines

### Good Error Messages

```typescript
// Clear and actionable
"Email already registered";
"Required fields not filled";
"User not found";
"Invalid email format";

// Specific to the context
"user.createUser.emailAlreadyRegistered";
"product.updateProduct.notFound";
"order.deleteOrder.cannotDelete";
```

### Avoid

```typescript
// Generic or unclear
"Error occurred";
"Something went wrong";
"Invalid input";

// Technical details exposed to users
"MongoDB connection timeout";
"SQL constraint violation";
"Redis cache miss";
```

## Security Considerations

### Information Disclosure

```typescript
// Good: Generic error for authentication
throw new CustomError("shared.error.invalidCredentials", 401);

// Bad: Reveals if user exists
throw new CustomError("user.passwordIncorrect", 401); // vs "user.userNotFound"
```

### Error Response Sanitization

```typescript
// The error handler middleware handles response structure
// Error messages are already sanitized through translation paths
if (error instanceof CustomError) {
  return reply
    .status(error.statusCode)
    .type("application/json")
    .send(JSON.stringify({ message: error.message }));
}
```
