# Controllers Development Guide

## Overview

Controllers in this Fastify-based API follow a clean architecture pattern where they handle HTTP requests and responses while delegating business logic to use cases.

## Architecture Pattern

### Base Structure

All controllers must extend the `AbstractController` class:

```typescript
import { AbstractController } from "@src/shared/classes/AbstractController";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
```

### Controller Class Template

```typescript
interface I{ModuleName}{Action}Controller {
  {actionName}UseCase: {Action}{ModuleName}UseCase;
}

export class {Action}{ModuleName}Controller extends AbstractController<
  I{ModuleName}Translation,
  {RequestModel}
> {
  private {actionName}UseCase: {Action}{ModuleName}UseCase;

  constructor(dependencies: I{ModuleName}{Action}Controller) {
    super();
    this.{actionName}UseCase = dependencies.{actionName}UseCase;
  }

  async handle(
    request: HttpRequest<{RequestModel}, I{ModuleName}Translation>,
  ): Promise<HttpResponse<I{ModuleName}Translation>> {
    // Extract data from request
    const data = request.body as {RequestModel};

    // Call use case
    const result = await this.{actionName}UseCase.execute(data);

    // Return structured response
    return {
      statusCode: {appropriateStatusCode},
      message: "{module}.{action}.{successMessage}",
      data: result,
    };
  }
}
```

## Key Principles

### 1. Dependency Injection

- Controllers receive their dependencies through constructor injection
- Dependencies are defined via interfaces for better testability
- Use cases are injected as private readonly properties

### 2. Generic Types

- Controllers are generic over translation interface and request model
- Translation interface provides type safety for error messages
- Request model ensures type safety for incoming data

### 3. Error Handling

- Let use cases throw `CustomError` instances
- Controller should not contain business logic
- Focus only on HTTP concerns (status codes, response format)

### 4. Response Structure

All responses follow the pattern:

```typescript
{
  statusCode: number;
  message?: string; // Translation key
  data?: any;
}
```

## Example Implementation

### CreateUserController

```typescript
import { HttpRequest, HttpResponse } from "@src/shared/types/http";
import { CreateUserRequestModel } from "../models/Request/CreateUserRequest.model";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { AbstractController } from "@src/shared/classes/AbstractController";
import { CreateUserUseCase } from "@modules/user/useCases/CreateUserUseCase";

interface ICreateUserController {
  createUserUseCase: CreateUserUseCase;
}

export class CreateUserController extends AbstractController<
  IUserTranslation,
  CreateUserRequestModel
> {
  private createUserUseCase: CreateUserUseCase;

  constructor(dependencies: ICreateUserController) {
    super();
    this.createUserUseCase = dependencies.createUserUseCase;
  }

  async handle(
    request: HttpRequest<CreateUserRequestModel, IUserTranslation>,
  ): Promise<HttpResponse<IUserTranslation>> {
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

## Naming Conventions

### File Names

- `{Action}{ModuleName}Controller.ts`
- Examples: `CreateUserController.ts`, `ListUsersController.ts`

### Class Names

- `{Action}{ModuleName}Controller`
- Examples: `CreateUserController`, `FindUserController`

### Interface Names

- `I{Action}{ModuleName}Controller`
- Examples: `ICreateUserController`, `IFindUserController`

## Common Status Codes

- **200**: Success for GET operations
- **201**: Success for POST operations (creation)
- **204**: Success for DELETE operations
- **400**: Bad request (validation errors)
- **404**: Resource not found
- **409**: Conflict (e.g., duplicate data)
- **500**: Internal server error

## Testing Considerations

- Controllers should be unit tested by mocking their use case dependencies
- Focus on testing HTTP-specific logic
- Verify correct status codes and response structures
- Test error handling scenarios

## File Location

Controllers should be placed in:
`src/modules/{moduleName}/controllers/{Action}{ModuleName}Controller.ts`
