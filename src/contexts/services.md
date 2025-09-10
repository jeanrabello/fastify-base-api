# Services Development Guide

## Overview

Services in this Fastify-based API provide specialized functionality that doesn't fit directly into the repository pattern. They handle external integrations, complex business operations, and cross-cutting concerns like authentication, encryption, and third-party API communication.

## Architecture Pattern

### Purpose

Services bridge the gap between use cases and external systems, providing:

- Authentication and authorization logic
- External API integrations
- Complex business operations
- Encryption and security utilities
- Email and notification services
- File processing and storage

### Position in Architecture

```
Use Cases → Services → External Systems/APIs
         → Repositories → Database
```

Services are injected into use cases alongside repositories to provide additional functionality.

## Service Categories

### 1. Authentication Services

Handle JWT token generation, validation, and security operations.

**Example: IAuthService**

```typescript
export interface IAuthService {
  generateToken(payload: any): string;
  verifyToken(token: string): any;
  generateRefreshToken(payload: any): string;
  verifyRefreshToken(token: string): any;
}
```

### 2. External API Services

Communicate with external services and APIs.

**Example: IUserService**

```typescript
export interface IUserService {
  findUserByEmail(email: string): Promise<any>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}
```

### 3. Utility Services

Provide common functionality like encryption, email, etc.

**Examples:**

- Email service for notifications
- File upload service
- Encryption service
- PDF generation service

## Implementation Pattern

### Service Interface Template

```typescript
// In src/modules/{moduleName}/types/I{ServiceName}Service.ts
export interface I{ServiceName}Service {
  {methodName}(input: {InputType}): Promise<{OutputType}>;
  // Additional methods...
}
```

### Service Implementation Template

```typescript
// In src/shared/services/{ServiceName}Service.ts (for shared services)
// OR src/modules/{moduleName}/services/{ServiceName}Service.ts (for module-specific)
import { I{ServiceName}Service } from "@modules/{moduleName}/types/I{ServiceName}Service";
import CustomError from "@src/shared/classes/CustomError";
import { I{ModuleName}Translation } from "@modules/{moduleName}/types/I{ModuleName}Translation";

export class {ServiceName}Service implements I{ServiceName}Service {
  private readonly configProperty: string;

  constructor() {
    // Initialize configuration, API clients, etc.
    this.configProperty = process.env.CONFIG_VALUE || "default";
  }

  async {methodName}(input: {InputType}): Promise<{OutputType}> {
    try {
      // Service implementation
      return result;
    } catch (error: any) {
      throw new CustomError<I{ModuleName}Translation>(
        "{moduleName}.{action}.error",
        500
      );
    }
  }
}
```

## Key Principles

### 1. Interface-Based Design

- Always define interfaces for services
- Program against interfaces, not implementations
- Enables easy testing and mocking

### 2. Dependency Injection

- Services are injected into use cases through constructor
- Use interfaces for type safety
- Enable easy swapping of implementations

### 3. Error Handling

- Services should throw CustomError instances for consistency
- Use appropriate translation keys that exist in the translation files
- CustomError accepts (translationPath, statusCode) parameters
- Include generic type for proper type safety: `CustomError<IModuleTranslation>`

### 4. Configuration

- Use environment variables for configuration
- Provide sensible defaults
- Validate configuration on startup

### 5. Stateless Design

- Services should be stateless
- No instance variables that change between calls
- Safe for concurrent use

## Example Implementation

### JWT Authentication Service

```typescript
// In src/shared/services/JWTAuthService.ts
import jwt, { SignOptions } from "jsonwebtoken";
import { IAuthService } from "@modules/auth/types/IAuthService";
import CustomError from "@src/shared/classes/CustomError";
import config from "@config/api";

export class JWTAuthService implements IAuthService {
  generateToken(payload: any): string {
    return jwt.sign(payload, config.jwt.tokenSecret, {
      expiresIn: config.jwt.tokenExpiresIn,
    } as SignOptions);
  }

  verifyToken(token: string): any {
    try {
      if (token.includes("Bearer ")) token = token.split(" ")[1];
      return jwt.verify(token, config.jwt.tokenSecret);
    } catch (error: any) {
      throw new CustomError("shared.error.invalidToken", 401);
    }
  }

  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, config.jwt.refreshTokenSecret, {
      expiresIn: config.jwt.refreshTokenExpiresIn,
    } as SignOptions);
  }

  verifyRefreshToken(token: string): any {
    try {
      if (token.includes("Bearer ")) token = token.split(" ")[1];
      return jwt.verify(token, config.jwt.refreshTokenSecret);
    } catch (error: any) {
      throw new CustomError("shared.error.invalidToken", 401);
    }
  }

  getTokenExpirationTime(): number {
    const expiresIn = config.jwt.tokenExpiresIn;
    if (expiresIn.endsWith("m")) {
      const minutes = parseInt(expiresIn.slice(0, -1));
      return isNaN(minutes) ? 900 : minutes * 60;
    }
    if (expiresIn.endsWith("h")) {
      const hours = parseInt(expiresIn.slice(0, -1));
      return isNaN(hours) ? 900 : hours * 3600;
    }
    if (expiresIn.endsWith("d")) {
      const days = parseInt(expiresIn.slice(0, -1));
      return isNaN(days) ? 900 : days * 86400;
    }
    return 900; // Default 15 minutes
  }
}
```

### External API Service

```typescript
// In src/shared/services/UserService.ts
import axios from "axios";
import bcrypt from "bcrypt";
import { IUserService } from "@modules/auth/types/IAuthService";
import config from "@config/api";
import CustomError from "@src/shared/classes/CustomError";
import { User } from "@src/shared/entities/user.entity";

export class UserService implements IUserService {
  private readonly userServiceUrl: string;

  constructor() {
    this.userServiceUrl = `${config.app.url}/user`;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await axios.post(`${this.userServiceUrl}/email`, {
        email,
      });

      if (response.status === 200) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new CustomError("shared.error.internalServerError", 500);
    }
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: any) {
      throw new CustomError("shared.error.internalServerError", 500);
    }
  }
}
```

## Use Case Integration

### Dependency Injection in Use Cases

```typescript
interface ILoginUseCase {
  authService: IAuthService;
  userService: IUserService;
  userRepository: IUserRepository; // Repository also injected
}

export class LoginUseCase implements IUseCase {
  private authService: IAuthService;
  private userService: IUserService;
  private userRepository: IUserRepository;

  constructor({ authService, userService, userRepository }: ILoginUseCase) {
    this.authService = authService;
    this.userService = userService;
    this.userRepository = userRepository;
  }

  async execute(input: LoginRequestModel): Promise<LoginResponseModel> {
    // Use external service to find user
    const user = await this.userService.findUserByEmail(input.email);

    // Use service for password verification
    const isValid = await this.userService.verifyPassword(
      input.password,
      user.password,
    );

    // Use auth service for token generation
    const accessToken = this.authService.generateToken(payload);

    // Use repository for database operations if needed
    await this.userRepository.updateLastLogin(user.id);

    return result;
  }
}
```

## Route Registration with Services

```typescript
// In module routes file
import { JWTAuthService } from "@src/shared/services/JWTAuthService";
import { UserService } from "@src/shared/services/UserService";

export async function authRoutes(app: FastifyTypedInstance) {
  // Initialize shared services
  const authService = new JWTAuthService();
  const userService = new UserService();

  // Initialize use cases with services
  const loginUseCase = new LoginUseCase({
    authService,
    userService,
  });

  // Initialize controllers
  const loginController = new LoginController({
    loginUseCase,
  });

  // Register routes
  app.post("/login", loginSchema, routeAdapter(loginController));
}
```

## Testing Services

### Unit Testing

```typescript
describe("JWTAuthService", () => {
  let authService: JWTAuthService;

  beforeEach(() => {
    authService = new JWTAuthService();
  });

  it("Should generate valid access token", () => {
    const payload = { id: "123", email: "test@example.com" };
    const token = authService.generateToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = authService.verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });
});
```

### Mocking Services in Use Case Tests

```typescript
describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockUserService: jest.Mocked<IUserService>;

  beforeEach(() => {
    mockAuthService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    mockUserService = {
      findUserByEmail: jest.fn(),
      verifyPassword: jest.fn(),
    };

    loginUseCase = new LoginUseCase({
      authService: mockAuthService,
      userService: mockUserService,
    });
  });

  it("Should authenticate user successfully", async () => {
    mockUserService.findUserByEmail.mockResolvedValue(mockUser);
    mockUserService.verifyPassword.mockResolvedValue(true);
    mockAuthService.generateToken.mockReturnValue("access-token");

    const result = await loginUseCase.execute(loginRequest);

    expect(result.accessToken).toBe("access-token");
  });
});
```

## Naming Conventions

### File Names

- `{ServiceName}Service.ts`
- Examples: `JWTAuthService.ts`, `EmailService.ts`, `UserService.ts`

### Interface Names

- `I{ServiceName}Service`
- Examples: `IAuthService`, `IEmailService`, `IUserService`

### Class Names

- `{ServiceName}Service`
- Examples: `JWTAuthService`, `EmailService`, `UserService`

## File Location

### Shared Services (Current Implementation)

Services that are used across multiple modules should be placed in:
`src/shared/services/{ServiceName}Service.ts`

Service interfaces should be placed in:
`src/modules/{moduleName}/types/I{ServiceName}Service.ts`

### Module-Specific Services (Future Implementation)

For services specific to a single module:
`src/modules/{moduleName}/services/{ServiceName}Service.ts`

**Note**: Currently, all services are implemented as shared services in `src/shared/services/` for better reusability across modules.

## Best Practices

1. **Single Responsibility**: Each service should have a clear, focused purpose
2. **Interface Segregation**: Create specific interfaces for different concerns
3. **Error Handling**: Use CustomError with proper translation keys and generic types
4. **Configuration**: Use environment variables with sensible defaults
5. **Logging**: Add appropriate logging for debugging and monitoring
6. **Testing**: Write comprehensive unit tests for all service methods
7. **Documentation**: Document complex business logic and external API interactions
8. **Translation Keys**: Use existing translation keys or add new ones to translation files
9. **Type Safety**: Always use generic types with CustomError for proper type checking
