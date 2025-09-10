# Testing Guide

## Overview

This guide provides comprehensive testing strategies and patterns for the Fastify-based API following clean architecture principles. It covers unit testing, integration testing, and best practices for each layer of the application.

## Testing Architecture

```
Test Structure
├── Unit Tests (Isolated components)
│   ├── Controllers → Mock use cases
│   ├── Use Cases → Mock repositories & services
│   ├── Services → Mock external dependencies
│   └── Utilities → Pure function testing
├── Integration Tests (Component interaction)
│   ├── Module Tests → Real dependencies within module
│   └── Database Tests → Real database operations
└── E2E Tests (Complete workflows)
    └── HTTP Endpoints → Full request/response cycle
```

## Testing Configuration

### Jest Configuration

Located in `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@utils/(.*)$": "<rootDir>/src/shared/utils/$1",
  },
  testMatch: ["**/*.(test|spec).(ts|tsx|js)"],
  maxWorkers: 1,
};
```

### Test File Structure

```
src/test/
├── modules/
│   ├── auth/
│   │   ├── mocks/
│   │   │   ├── entities/
│   │   │   └── services/
│   │   └── unit/
│   │       ├── controllers/
│   │       ├── useCases/
│   │       └── services/
│   ├── user/
│   │   └── unit/
│   │       ├── controllers/
│   │       ├── useCases/
│   │       └── repositories/
│   └── shared/
│       └── unit/
│           ├── utils/
│           └── services/
└── integration/
    ├── modules/
    └── database/
```

## Unit Testing Patterns

### 1. Controller Testing

Controllers should be tested by mocking their use case dependencies.

**Template:**

```typescript
import { {Action}{ModuleName}Controller } from "@modules/{moduleName}/controllers/{Action}{ModuleName}Controller";
import { {Action}{ModuleName}UseCase } from "@modules/{moduleName}/useCases/{Action}{ModuleName}UseCase";
import { HttpRequest } from "@src/shared/types/http";
import { I{ModuleName}Translation } from "@modules/{moduleName}/types/I{ModuleName}Translation";
import enUs from "@modules/{moduleName}/lang/en-us";
import CustomError from "@src/shared/classes/CustomError";

describe("{Action}{ModuleName}Controller", () => {
  let controller: {Action}{ModuleName}Controller;
  let useCase: jest.Mocked<{Action}{ModuleName}UseCase>;
  const languagePack = enUs as I{ModuleName}Translation;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<{Action}{ModuleName}UseCase>;

    controller = new {Action}{ModuleName}Controller({
      {actionName}UseCase: useCase
    });
  });

  describe("Successful execution", () => {
    it("Should return success response when operation succeeds", async () => {
      const requestData = { /* mock request data */ };
      const expectedResponse = { /* mock response data */ };

      useCase.execute.mockResolvedValue(expectedResponse);

      const request: HttpRequest<any, any, any, I{ModuleName}Translation> = {
        body: requestData,
        languagePack,
        lang: "en-US",
      };

      const { data, message, statusCode } = await controller.handle(request);

      expect(useCase.execute).toHaveBeenCalledWith(requestData);
      expect(useCase.execute).toHaveBeenCalledTimes(1);
      expect(statusCode).toBe(201); // or appropriate status
      expect(data).toEqual(expectedResponse);
      expect(message).toBe("{module}.{action}.success");
    });
  });

  describe("Error scenarios", () => {
    it("Should propagate errors from use case", async () => {
      const requestData = { /* mock request data */ };
      const error = new CustomError<I{ModuleName}Translation>(
        "{module}.{action}.error",
        400
      );

      useCase.execute.mockRejectedValue(error);

      const request: HttpRequest<any, any, any, I{ModuleName}Translation> = {
        body: requestData,
        languagePack,
        lang: "en-US",
      };

      await expect(controller.handle(request)).rejects.toThrow(error);
      expect(useCase.execute).toHaveBeenCalledWith(requestData);
    });
  });
});
```

### 2. Use Case Testing

Use cases should be tested by mocking repository and service dependencies.

**Template:**

```typescript
import { {Action}{ModuleName}UseCase } from "@modules/{moduleName}/useCases/{Action}{ModuleName}UseCase";
import { I{ModuleName}Repository } from "@modules/{moduleName}/types/I{ModuleName}Repository";
import { IAuthService } from "@modules/auth/types/IAuthService";
import CustomError from "@src/shared/classes/CustomError";

describe("{Action}{ModuleName}UseCase", () => {
  let useCase: {Action}{ModuleName}UseCase;
  let repository: jest.Mocked<I{ModuleName}Repository>;
  let service: jest.Mocked<IAuthService>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      // ... other repository methods
    } as unknown as jest.Mocked<I{ModuleName}Repository>;

    service = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      // ... other service methods
    } as unknown as jest.Mocked<IAuthService>;

    useCase = new {Action}{ModuleName}UseCase({
      {moduleName}Repository: repository,
      authService: service,
    });
  });

  describe("Successful execution", () => {
    it("Should process data and return result", async () => {
      const inputData = { /* mock input */ };
      const mockRepositoryResult = { /* mock repository response */ };
      const expectedResult = { /* expected use case result */ };

      repository.save.mockResolvedValue(mockRepositoryResult);
      service.generateToken.mockReturnValue("mock-token");

      const result = await useCase.execute(inputData);

      expect(repository.save).toHaveBeenCalledWith(inputData);
      expect(service.generateToken).toHaveBeenCalledWith(/* expected payload */);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("Input validation", () => {
    it("Should throw error for invalid input", async () => {
      const invalidInput = { /* invalid data */ };

      await expect(useCase.execute(invalidInput)).rejects.toThrow(
        new CustomError("shared.error.requiredFields", 400)
      );

      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("Business logic validation", () => {
    it("Should throw error for business rule violation", async () => {
      const inputData = { /* valid input but violates business rule */ };

      repository.findByEmail.mockResolvedValue({ /* existing record */ });

      await expect(useCase.execute(inputData)).rejects.toThrow(
        new CustomError("{module}.{action}.conflict", 409)
      );
    });
  });
});
```

### 3. Service Testing

Services should be tested by mocking external dependencies (HTTP clients, databases, etc.).

**Template:**

```typescript
import { {ServiceName}Service } from "@src/shared/services/{ServiceName}Service";
import CustomError from "@src/shared/classes/CustomError";

// Mock external dependencies
jest.mock("axios");
jest.mock("jsonwebtoken");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("{ServiceName}Service", () => {
  let service: {ServiceName}Service;

  beforeEach(() => {
    service = new {ServiceName}Service();
    jest.clearAllMocks();
  });

  describe("Method testing", () => {
    it("Should handle successful operation", async () => {
      const inputData = { /* mock input */ };
      const mockResponse = { /* mock external response */ };

      mockedAxios.post.mockResolvedValue({
        status: 200,
        data: mockResponse,
      });

      const result = await service.methodName(inputData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/endpoint"),
        inputData
      );
      expect(result).toEqual(mockResponse);
    });

    it("Should handle external service errors", async () => {
      const inputData = { /* mock input */ };
      const error = new Error("External service error");

      mockedAxios.post.mockRejectedValue(error);

      await expect(service.methodName(inputData)).rejects.toThrow(
        new CustomError("shared.error.internalServerError", 500)
      );
    });
  });
});
```

### 4. Utility Function Testing

Pure functions should be tested with various inputs and edge cases.

**Template:**

```typescript
import { utilityFunction } from "@utils/utilityFunction";

describe("utilityFunction", () => {
  it("Should process valid input correctly", () => {
    const input = "valid input";
    const expected = "expected output";

    const result = utilityFunction(input);

    expect(result).toBe(expected);
  });

  it("Should handle edge cases", () => {
    expect(utilityFunction("")).toBe("");
    expect(utilityFunction(null)).toBe(null);
    expect(utilityFunction(undefined)).toBe(undefined);
  });

  it("Should throw error for invalid input", () => {
    expect(() => utilityFunction("invalid")).toThrow("Invalid input");
  });
});
```

## Mock Patterns

### 1. Entity Mocks

Create reusable entity mocks in `src/test/modules/{module}/mocks/entities/`:

```typescript
// User.mock.ts
import { User } from "@src/shared/entities/user.entity";

export const mockUser: User = {
  id: "mock-user-id",
  username: "testuser",
  email: "test@example.com",
  password: "hashedpassword",
  createdAt: new Date("2023-01-01T00:00:00.000Z"),
  updatedAt: new Date("2023-01-01T00:00:00.000Z"),
};

export const mockUserWithoutPassword: Partial<User> = {
  id: mockUser.id,
  username: mockUser.username,
  email: mockUser.email,
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
};
```

### 2. Request/Response Mocks

Create model mocks in `src/test/modules/{module}/mocks/models/`:

```typescript
// CreateUser.mock.ts
import { CreateUserRequestModel } from "@modules/user/models/Request/CreateUserRequest.model";

export const validCreateUserModel: CreateUserRequestModel = {
  username: "testuser",
  email: "test@example.com",
  password: "validPassword123",
};

export const invalidCreateUserModel = {
  username: "", // Invalid: empty username
  email: "invalid-email", // Invalid: malformed email
  // Missing: password
};
```

### 3. Service Mocks

Create service mocks in `src/test/modules/{module}/mocks/services/`:

```typescript
// AuthService.mock.ts
import { IAuthService } from "@modules/auth/types/IAuthService";

export const mockAuthService: jest.Mocked<IAuthService> = {
  generateToken: jest.fn().mockReturnValue("mock-access-token"),
  verifyToken: jest
    .fn()
    .mockReturnValue({ id: "user-id", email: "test@example.com" }),
  generateRefreshToken: jest.fn().mockReturnValue("mock-refresh-token"),
  verifyRefreshToken: jest
    .fn()
    .mockReturnValue({ id: "user-id", email: "test@example.com" }),
  getTokenExpirationTime: jest.fn().mockReturnValue(900),
};
```

## Testing Best Practices

### 1. Test Structure

- **Arrange**: Set up test data and mocks
- **Act**: Execute the function being tested
- **Assert**: Verify the results

### 2. Descriptive Test Names

```typescript
// Good
it("Should return user data when valid ID is provided");
it("Should throw 404 error when user does not exist");
it("Should hash password before saving user");

// Bad
it("Should work");
it("Test user creation");
it("Error case");
```

### 3. Test Categories

Group tests by functionality:

```typescript
describe("UserController", () => {
  describe("Successful operations", () => {
    // Happy path tests
  });

  describe("Input validation", () => {
    // Validation error tests
  });

  describe("Business logic errors", () => {
    // Business rule violation tests
  });

  describe("External dependency errors", () => {
    // Third-party service error tests
  });
});
```

### 4. Mock Management

- Reset mocks between tests using `beforeEach(() => jest.clearAllMocks())`
- Use specific return values instead of generic mocks when possible
- Mock at the appropriate level (interface, not implementation)

### 5. Error Testing

Always test error scenarios:

```typescript
it("Should handle database connection errors", async () => {
  repository.save.mockRejectedValue(new Error("Database connection failed"));

  await expect(useCase.execute(validInput)).rejects.toThrow(
    new CustomError("shared.error.internalServerError", 500),
  );
});
```

## Integration Testing

### Module Integration Tests

Test complete module functionality with real implementations:

```typescript
describe("User Module Integration", () => {
  let repository: IUserRepository;

  beforeAll(async () => {
    // Setup test database
    repository = new MongoUserRepository();
  });

  afterEach(async () => {
    // Clean up test data
    await repository.deleteAll();
  });

  it("Should create and retrieve user", async () => {
    const useCase = new CreateUserUseCase({ userRepository: repository });
    const userData = {
      /* valid user data */
    };

    const createdUser = await useCase.execute(userData);

    expect(createdUser.id).toBeDefined();
    expect(createdUser.email).toBe(userData.email);
  });
});
```

## Coverage Requirements

Maintain high test coverage across all layers:

- **Controllers**: 100% (focus on HTTP logic)
- **Use Cases**: 100% (focus on business logic)
- **Services**: 95%+ (external dependencies may be challenging)
- **Utilities**: 100% (pure functions should be fully testable)

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- UserController.spec.ts

# Run tests in watch mode
npm test -- --watch

# Run tests for specific module
npm test -- --testPathPattern=modules/user
```

### Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage --coverageReporters=text-summary

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html
```

## Debugging Tests

### Common Issues

1. **Mock not working**: Ensure mocks are properly typed and reset
2. **Async test failures**: Use `await` with async operations
3. **Module import errors**: Check path aliases in Jest config
4. **Test isolation**: Ensure tests don't depend on each other

### Debugging Tools

```typescript
// Debug specific test
it.only("Should debug this test", () => {
  console.log("Debug information");
  // Test implementation
});

// Skip problematic test temporarily
it.skip("Should fix this test later", () => {
  // Test implementation
});
```

This comprehensive testing approach ensures code quality, prevents regressions, and provides confidence in the application's reliability.
