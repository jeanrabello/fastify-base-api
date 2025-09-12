# 🚀 Fastify Base API

A modern, production-ready REST API starter built with Fastify, TypeScript, and MongoDB. Features Clean Architecture, comprehensive authentication, internationalization support, and 100% test coverage.

## 📚 Essential Reading

**Before developing, read the complete patterns in `src/contexts/`:**

- `architecture-overview.md` - Master system design reference
- `controllers.md` - HTTP request/response patterns
- `useCases.md` - Business logic implementation
- `services.md` - External integrations & utilities
- `repositories.md` - Data access patterns
- `schemas.md` - Validation with Zod & OpenAPI
- `translations.md` - internacionalization implementation guide
- `error-handling.md` - Consistent error patterns
- `testing.md` - Complete testing strategies

## 🏗️ Architecture Principles

**Clean Architecture Layers:**

```
Presentation Layer (Controllers, Routes, Middleware)
       ↓
Business Layer (Use Cases, Services, Entities)
       ↓
Data Access Layer (Repositories, Database)
```

**Core Rules:**

- **Dependency Injection**: Constructor-based, no implicit singletons
- **Input Validation**: Zod schemas per endpoint with OpenAPI documentation
- **Error Handling**: `CustomError` with translation keys + HTTP status codes
- **Separation of Concerns**: Controllers adapt HTTP ↔ Use Cases contain business logic
- **Type Safety**: Strict TypeScript throughout, generic types for Controllers
- **Testing**: 100% coverage requirement for Controllers and Use Cases

## 🛠️ Requirements

- **Node.js** 22.x or higher
- **MongoDB** 4.4+ (or Docker for development)
- **npm** 9.x+ (included with Node.js)

## ⚡ Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd fastify-base-api
npm install

# Environment setup
cp .env.example .env
# Edit .env with your configuration

# Development server
npm run dev
```

### 🐳 Docker Development

```bash
# Start all services (API + MongoDB)
npm run compose:dev

# Stop services
npm run compose:down
```

## 🔐 Authentication & Authorization

The API includes a complete authentication system:

**Features:**

- JWT-based authentication with access and refresh tokens
- Protected routes with `app.authenticate` middleware
- Owner-only authorization for user resources
- Multi-language error messages

**Endpoints:**

- `POST /api/auth/login` - User authentication
- `GET /api/auth/validate` - Token validation
- `POST /api/auth/refresh` - Token refresh

**Protected Routes:**

- `GET /api/user/` - List users (requires auth)
- `GET /api/user/:id` - Get user by ID (requires auth)
- `PUT /api/user/:id` - Update user email (owner only)
- `DELETE /api/user/:id` - Delete user (owner only)

## 📘 API Documentation

**Swagger UI**: Access interactive API docs at `http://localhost:3000/docs`

**Available Modules:**

- **Auth Module**: Authentication, token management
- **User Module**: User CRUD operations with authorization

**API Base URL**: `http://localhost:3000/api`

## 🧪 Testing & Quality Assurance

**Test Coverage**: 100% (Statements, Branches, Functions, Lines)

```bash
# Run all tests
npm test

# Coverage report
npm test -- --coverage

# Watch mode
npm test -- --watch

# Test specific module
npm test -- user
npm test -- auth
```

**Testing Strategy:**

- **Unit Tests**: Controllers and Use Cases (100% coverage requirement)
- **Integration Tests**: Component interactions
- **E2E Tests**: Complete request/response workflows
- **Mocking**: Comprehensive mocks for external dependencies

**Quality Standards:**

- TypeScript strict mode
- ESLint + Prettier configuration

## 🗂️ Project Structure

```
src/
├── app.ts                     # Fastify app configuration
├── server.ts                  # Server startup
├── config/                    # Environment configuration
├── contexts/                  # 📚 DEVELOPMENT GUIDELINES (READ FIRST)
│   ├── architecture-overview.md
│   ├── controllers.md
│   ├── useCases.md
│   ├── services.md
│   ├── repositories.md
│   ├── schemas.md
│   ├── translations.md
│   ├── error-handling.md
│   └── testing.md
├── infra/                     # Infrastructure layer
│   └── mongo/                 # MongoDB repositories
├── loaders/                   # Application initializers
├── modules/                   # Feature modules
│   ├── auth/                  # Authentication module
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── useCases/         # Business logic
│   │   ├── schemas/          # Validation + OpenAPI
│   │   ├── types/            # TypeScript interfaces
│   │   └── lang/             # Translations
│   └── user/                  # User management module
│       ├── controllers/
│       ├── useCases/
│       ├── models/           # DTOs and data models
│       ├── schemas/
│       ├── types/
│       └── lang/
├── plugins/                   # Fastify plugins
├── shared/                    # Shared utilities
│   ├── classes/              # Base classes (AbstractController, CustomError)
│   ├── entities/             # Domain entities
│   ├── middlewares/          # Authentication, CORS, etc.
│   ├── services/             # Cross-module services
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Utility functions
└── test/                      # Test files (mirrors src structure)
    └── modules/              # Module-specific tests
```

## ➕ Adding New Features

**Follow this order when creating new modules:**

1. **Read Documentation**: Start with `src/contexts/architecture-overview.md`
2. **Entity Design**: Define domain entities in `src/shared/entities/`
3. **Module Structure**: Create module folder `src/modules/{moduleName}/`
4. **Types & Interfaces**: Define in `src/modules/{moduleName}/types/`
5. **Repository Interface**: Define data access contracts
6. **Repository Implementation**: Implement in `src/infra/mongo/repositories/`
7. **Models & DTOs**: Create request/response models
8. **Validation Schemas**: Zod schemas with OpenAPI documentation
9. **Use Cases**: Implement business logic
10. **Controllers**: HTTP adapters using AbstractController
11. **Routes**: Register with dependency injection
12. **Translations**: Add internationalization support for all locales
13. **Tests**: Unit tests for controllers and use cases (100% coverage)

**Module Template:**

```typescript
// Controller Template
export class {Action}{ModuleName}Controller extends AbstractController<
  I{ModuleName}Translation,
  {RequestModel},
  {ParamsModel},
  {QueryModel}
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

## 🌐 Internationalization

**Supported Languages:**

- `en-us` - English (United States)
- `pt-br` - Portuguese (Brazil)
- `es-es` - Spanish (Spain)
- `fr-fr` - French (France)
- `it-it` - Italian (Italy)

**Custom Implementation Features:**

- **Type-safe translations** - TypeScript interfaces prevent missing keys
- **Module-based organization** - Each module manages its own translations
- **Automatic language detection** - From `Accept-Language` header
- **Compile-time validation** - Translation keys validated at build time

**How it works:**

1. **Translation Middleware**: Detects language from HTTP headers
2. **Module Translation Files**: Each module has its own language files
3. **Type Safety**: Interfaces ensure all translation keys exist
4. **Runtime Loading**: Translations loaded dynamically per request

**Implementation:**

```typescript
// 1. Define module translation interface
export interface IUserTranslation extends Translation {
  user: {
    createUser: {
      created: string;
      error: string;
      emailAlreadyRegistered: string;
    };
  };
}

// 2. Implement for each language
const enUs: IUserTranslation = {
  user: {
    createUser: {
      created: "User created successfully!",
      error: "Error creating user",
      emailAlreadyRegistered: "Email already registered",
    },
  },
};

// 3. Use in controllers/use cases
throw new CustomError<IUserTranslation>(
  "user.createUser.emailAlreadyRegistered",
  409,
);
```

## ❗ Error Handling

**Consistent Error Pattern:**

```typescript
// Business Logic Errors
throw new CustomError<IModuleTranslation>("module.action.errorKey", 400);

// Authorization Errors
throw new CustomError("shared.error.accessForbidden", 403);

// Validation Errors
throw new CustomError("shared.error.requiredFields", 400);
```

**HTTP Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error (unexpected errors)

## ⚙️ Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint:check      # Check code style and errors
npm run lint:fix        # Fix auto-fixable lint issues

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report

# Docker
npm run compose:dev     # Start development environment
```

## 🚀 Deployment

**Production Build:**

```bash
npm run build
npm start
```

**Environment Variables:**

```bash
# Required
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fastify-api
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## 📚 Documentation Reference

**Essential Context Documents** (located in `src/contexts/`):

| Document                   | Purpose                                          | When to Read                            |
| -------------------------- | ------------------------------------------------ | --------------------------------------- |
| `architecture-overview.md` | Master system design and component relationships | **Start here** - Before any development |
| `controllers.md`           | HTTP request/response handling patterns          | Creating new endpoints                  |
| `useCases.md`              | Business logic implementation guide              | Implementing business rules             |
| `services.md`              | External integrations and utilities              | Working with external APIs/services     |
| `repositories.md`          | Data access layer patterns                       | Database operations                     |
| `schemas.md`               | Validation with Zod and OpenAPI docs             | Input validation and API documentation  |
| `translations.md`          | Internationalization implementation              | Adding multi-language support           |
| `error-handling.md`        | Consistent error patterns                        | Error management and user feedback      |
| `testing.md`               | Complete testing strategies                      | Writing comprehensive tests             |

**Quick Reference:**

- **New Module**: Read `architecture-overview.md` → `modules.md`
- **HTTP Endpoints**: Read `controllers.md` → `schemas.md`
- **Business Logic**: Read `useCases.md` → `services.md`
- **Data Access**: Read `repositories.md` → `entities.md`
- **Testing**: Read `testing.md` for complete strategies

## 🏆 Features

✅ **Clean Architecture** - Presentation, Business, and Data layers  
✅ **Authentication** - JWT with access/refresh tokens  
✅ **Authorization** - Owner-only resource access  
✅ **Validation** - Zod schemas with OpenAPI documentation  
✅ **Internationalization** - 5 languages supported  
✅ **Error Handling** - Consistent, translatable error messages  
✅ **Testing** - 100% coverage with comprehensive test suite  
✅ **Type Safety** - Strict TypeScript throughout  
✅ **Documentation** - Comprehensive guides and API docs  
✅ **Docker Support** - Development environment ready

---

**This README reflects the current implementation and established patterns. For detailed development guidance, always refer to the documentation in `src/contexts/`.**
