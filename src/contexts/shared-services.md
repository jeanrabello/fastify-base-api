# Shared Services Guide

## Overview

Shared services are reusable components that provide functionality across multiple modules in the application. They handle cross-cutting concerns like authentication, external API integrations, and utility operations that don't belong to a specific domain.

## Architecture Rationale

### Why Shared Services?

1. **Reusability**: Avoid duplicating common functionality across modules
2. **Consistency**: Ensure uniform behavior for cross-cutting concerns
3. **Maintainability**: Centralize common logic for easier updates
4. **Testability**: Single place to mock external dependencies

### When to Use Shared Services

- **Authentication & Authorization**: JWT token management, user verification
- **External API Integrations**: Third-party service communications
- **Cross-Module Operations**: User lookup across modules
- **Utility Functions**: Encryption, hashing, validation
- **Infrastructure Concerns**: Logging, metrics, caching

### When NOT to Use Shared Services

- **Domain-Specific Logic**: Business rules specific to one module
- **Entity Operations**: Direct database operations for specific entities
- **Module-Specific Validations**: Business validations unique to a domain

## Current Shared Services

### File Structure

```
src/shared/services/
├── JWTAuthService.ts       # JWT token management
├── UserService.ts          # Cross-module user operations
└── index.ts                # Service exports (optional)
```

### 1. JWTAuthService

**Purpose**: Handles JWT token generation, validation, and management

**Location**: `src/shared/services/JWTAuthService.ts`

**Interface**: `src/modules/auth/types/IAuthService.ts`

```typescript
export interface IAuthService {
  generateToken(payload: any): string;
  verifyToken(token: string): any;
  generateRefreshToken(payload: any): string;
  verifyRefreshToken(token: string): any;
  getTokenExpirationTime(): number;
}
```

**Implementation Highlights**:

- Uses configuration from `@config/api`
- Handles Bearer token format automatically
- Supports multiple time formats (minutes, hours, days)
- Throws `CustomError` with appropriate status codes

**Usage Across Modules**:

```typescript
// In auth module
import { JWTAuthService } from "@src/shared/services/JWTAuthService";

const authService = new JWTAuthService();
const token = authService.generateToken({
  id: "123",
  email: "user@example.com",
});
```

### 2. UserService

**Purpose**: Handles user-related operations that span multiple modules

**Location**: `src/shared/services/UserService.ts`

**Interface**: `src/modules/auth/types/IAuthService.ts` (IUserService)

```typescript
export interface IUserService {
  findUserByEmail(email: string): Promise<User | null>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}
```

**Implementation Highlights**:

- Makes HTTP calls to user endpoints
- Handles password verification with bcrypt
- Returns null for 404s, throws CustomError for other failures
- Uses axios for HTTP communication

**Usage Example**:

```typescript
// In auth module login use case
import { UserService } from "@src/shared/services/UserService";

const userService = new UserService();
const user = await userService.findUserByEmail("user@example.com");
const isValidPassword = await userService.verifyPassword(
  "password",
  user.password,
);
```

## Service Development Patterns

### 1. Interface-First Design

Always define interfaces in the appropriate module:

```typescript
// src/modules/auth/types/IEmailService.ts
export interface IEmailService {
  sendWelcomeEmail(email: string, name: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, token: string): Promise<boolean>;
}
```

Then implement in shared services:

```typescript
// src/shared/services/EmailService.ts
import { IEmailService } from "@modules/auth/types/IEmailService";

export class EmailService implements IEmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    // Implementation
  }
}
```

### 2. Configuration Management

Use centralized configuration:

```typescript
import config from "@config/api";

export class EmailService {
  constructor() {
    this.smtpConfig = {
      host: config.email.host,
      port: config.email.port,
      secure: config.app.env === "production",
    };
  }
}
```

### 3. Error Handling

Use consistent error handling with `CustomError`:

```typescript
export class ExternalAPIService {
  async callExternalAPI(data: any): Promise<any> {
    try {
      const response = await axios.post(this.apiUrl, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Expected not found
      }

      // Log error for debugging
      console.error("External API error:", error.message);

      // Throw consistent error
      throw new CustomError("shared.error.externalServiceError", 502);
    }
  }
}
```

### 4. Dependency Injection

Services should be injected into use cases:

```typescript
// Use case constructor
interface ILoginUseCase {
  authService: IAuthService;
  userService: IUserService;
  emailService: IEmailService;
}

export class LoginUseCase {
  constructor({ authService, userService, emailService }: ILoginUseCase) {
    this.authService = authService;
    this.userService = userService;
    this.emailService = emailService;
  }
}
```

Route registration:

```typescript
// In module routes
const authService = new JWTAuthService();
const userService = new UserService();
const emailService = new EmailService();

const loginUseCase = new LoginUseCase({
  authService,
  userService,
  emailService,
});
```

## Testing Shared Services

### 1. Unit Testing

Mock external dependencies:

```typescript
import { UserService } from "@src/shared/services/UserService";
import axios from "axios";
import bcrypt from "bcrypt";

jest.mock("axios");
jest.mock("bcrypt");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  it("Should find user by email", async () => {
    const mockUser = { id: "123", email: "test@example.com" };
    mockedAxios.post.mockResolvedValue({
      status: 200,
      data: { data: mockUser },
    });

    const result = await userService.findUserByEmail("test@example.com");

    expect(result).toEqual(mockUser);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining("/user/email"),
      { email: "test@example.com" },
    );
  });
});
```

### 2. Mocking in Use Case Tests

Create mock implementations:

```typescript
// src/test/modules/shared/mocks/services/UserService.mock.ts
import { IUserService } from "@src/shared/types/services";

export const mockUserService: jest.Mocked<IUserService> = {
  findUserByEmail: jest.fn(),
  verifyPassword: jest.fn(),
};

// Reset function for beforeEach
export const resetUserServiceMock = () => {
  Object.values(mockUserService).forEach((mock) => mock.mockReset());
};
```

Use in tests:

```typescript
import {
  mockUserService,
  resetUserServiceMock,
} from "../../mocks/services/UserService.mock";

beforeEach(() => {
  resetUserServiceMock();
});

it("Should authenticate user", async () => {
  mockUserService.findUserByEmail.mockResolvedValue(mockUser);
  mockUserService.verifyPassword.mockResolvedValue(true);

  const result = await loginUseCase.execute(loginData);

  expect(result.accessToken).toBeDefined();
});
```

## Security Considerations

### 1. Input Validation

Validate inputs in shared services:

```typescript
export class UserService {
  async findUserByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== "string") {
      throw new CustomError("shared.error.invalidFields", 400);
    }

    if (!this.isValidEmail(email)) {
      throw new CustomError("shared.error.invalidEmail", 400);
    }

    // Proceed with operation
  }
}
```

### 2. Secret Management

Don't log or expose sensitive data:

```typescript
export class JWTAuthService {
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.tokenSecret);
    } catch (error: any) {
      // Don't log the token or secret
      console.error("Token verification failed");
      throw new CustomError("shared.error.invalidToken", 401);
    }
  }
}
```

## Migration Guidelines

### Moving Module Services to Shared

When promoting a module service to shared:

1. **Check Dependencies**: Ensure no circular dependencies
2. **Update Interfaces**: Move interfaces to appropriate module
3. **Update Imports**: Change import paths across codebase
4. **Update Tests**: Move and update test files
5. **Update Documentation**: Update module documentation

### Example Migration

```typescript
// Before: src/modules/auth/services/JWTService.ts
// After: src/shared/services/JWTAuthService.ts

// Update imports in use cases
// Before
import { JWTService } from "../services/JWTService";

// After
import { JWTAuthService } from "@src/shared/services/JWTAuthService";
```

## Best Practices Summary

1. **Interface-First**: Always define interfaces before implementation
2. **Consistent Errors**: Use CustomError with proper status codes and translation keys
3. **Configuration**: Use centralized config, avoid hardcoded values
4. **Testing**: Mock external dependencies, test error scenarios
5. **Security**: Validate inputs, protect secrets, implement rate limiting
6. **Documentation**: Document service purpose and usage patterns

Shared services provide the foundation for building scalable, maintainable applications by centralizing common functionality while maintaining clear separation of concerns.
