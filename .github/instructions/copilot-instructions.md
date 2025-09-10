---
applyTo: "**"
---

# GitHub Copilot Instructions

This Fastify API project follows clean architecture principles with strict TypeScript patterns. Before writing any code, **ALWAYS** read the relevant context documents to understand the established patterns.

## Core Principles

### 1. Architecture Understanding

- **MUST READ FIRST**: #src/contexts/architecture-overview.md for the complete system design
- Follow clean architecture layers: Presentation → Business → Data Access
- Use dependency injection throughout the application
- Maintain strict separation of concerns

### 2. Code Generation Rules

#### When creating new endpoints/features:

1. **Start with architecture**: Read #src/contexts/architecture-overview.md
2. **Define entities**: Use #src/contexts/entities.md for domain modeling
3. **Plan module structure**: Follow #src/contexts/modules.md patterns
4. **Create data contracts**: Use #src/contexts/models.md for DTOs
5. **Add validation**: Follow #src/contexts/schemas.md with Zod
6. **Implement repositories**: Use #src/contexts/repositories.md patterns
7. **Add services**: Use #src/contexts/services.md and #src/contexts/shared-services.md
8. **Create use cases**: Follow #src/contexts/useCases.md for business logic
9. **Build controllers**: Use #src/contexts/controllers.md for HTTP handling
10. **Add translations**: Follow #src/contexts/translations.md for custom translation system
11. **Handle errors**: Use #src/contexts/error-handling.md patterns

#### Code Quality Standards:

- **Type Safety**: Use TypeScript strictly, no `any` types
- **Generic Types**: Leverage generics for Controllers and error handling
- **Interface-First**: Program against interfaces, not implementations
- **Consistency**: Follow existing naming conventions and patterns
- **Error Handling**: Use CustomError with translation keys
- **Validation**: Use Zod schemas for all input validation

### 3. File Structure Patterns

```
src/modules/{moduleName}/
├── {moduleName}.routes.ts         # Dependency injection & route setup
├── controllers/                   # HTTP request handlers
├── useCases/                     # Business logic
├── services/                     # Module-specific services (optional)
├── models/                       # Request/Response DTOs
├── schemas/                      # Zod validation & OpenAPI docs
├── types/                        # Interfaces & type definitions
└── lang/                         # Custom translations

src/shared/services/              # Cross-module shared services
├── JWTAuthService.ts            # Authentication service
├── UserService.ts               # User operations across modules
└── {ServiceName}Service.ts      # Other shared services
```

### 4. Component Templates

#### Controller Template:

```typescript
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

  async handle(
    request: HttpRequest<{RequestModel}, {ParamsModel}, {QueryModel}, I{ModuleName}Translation>
  ): Promise<HttpResponse<I{ModuleName}Translation>> {
    const result = await this.{actionName}UseCase.execute(request.body);
    return {
      statusCode: 201,
      message: "{module}.{action}.success",
      data: result,
    };
  }
}
```

#### Use Case Template:

```typescript
export class {Action}{ModuleName}UseCase implements IUseCase {
  constructor({
    {moduleName}Repository,
    {serviceName}Service
  }: I{Action}{ModuleName}UseCase) {
    this.{moduleName}Repository = {moduleName}Repository;
    this.{serviceName}Service = {serviceName}Service;
  }

  async execute(input: {InputModel}): Promise<{OutputType}> {
    // 1. Input validation
    // 2. Business logic validation
    // 3. Service operations (external integrations)
    // 4. Repository operations (data access)
    // 5. Return result
  }
}
```

#### Shared Service Template:

```typescript
// Location: src/shared/services/{ServiceName}Service.ts
import { I{ServiceName}Service } from "@modules/{moduleName}/types/I{ServiceName}Service";
import CustomError from "@src/shared/classes/CustomError";
import config from "@config/api";

export class {ServiceName}Service implements I{ServiceName}Service {
  async {methodName}(input: {InputType}): Promise<{OutputType}> {
    try {
      // External API calls, authentication, utilities, etc.
      return result;
    } catch (error: any) {
      throw new CustomError("shared.error.internalServerError", 500);
    }
  }
}
```

### 5. Context Documents Reference

| Component           | Guide                                  | Purpose                            |
| ------------------- | -------------------------------------- | ---------------------------------- |
| **Architecture**    | #src/contexts/architecture-overview.md | Master reference for system design |
| **Controllers**     | #src/contexts/controllers.md           | HTTP request/response handling     |
| **Use Cases**       | #src/contexts/useCases.md              | Business logic implementation      |
| **Services**        | #src/contexts/services.md              | External integrations & utilities  |
| **Shared Services** | #src/contexts/shared-services.md       | Cross-module services guide        |
| **Repositories**    | #src/contexts/repositories.md          | Data access patterns               |
| **Models**          | #src/contexts/models.md                | Data transfer objects              |
| **Schemas**         | #src/contexts/schemas.md               | Validation with Zod & OpenAPI      |
| **Entities**        | #src/contexts/entities.md              | Domain modeling                    |
| **Translations**    | #src/contexts/translations.md          | Custom translation system          |
| **Error Handling**  | #src/contexts/error-handling.md        | Consistent error patterns          |
| **Modules**         | #src/contexts/modules.md               | Module organization                |
| **Testing**         | #src/contexts/testing.md               | Complete testing guide             |
| **Configuration**   | #src/contexts/configuration.md         | Environment & config management    |

### 6. Development Workflow

#### For new features:

1. Read architecture-overview.md to understand the system
2. Check existing modules for similar patterns
3. Create entities if needed
4. Build from data layer up: Repository → Service → Use Case → Controller
5. Add validation schemas and translations
6. Register routes with proper dependency injection

#### For bug fixes:

1. Identify the appropriate layer (HTTP, Business, Data)
2. Read the relevant context document
3. Maintain existing patterns and conventions
4. Use CustomError for business logic errors

### 7. Testing Patterns

**MUST READ**: #src/contexts/testing.md for complete testing guide

- **Unit Tests**: Mock dependencies, test individual components
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Coverage Goal**: Maintain 100% coverage for controllers and use cases
- Always test error scenarios and edge cases
- Use provided mock patterns and templates

### 8. Important Notes

- **Shared vs Module Services**: Use `src/shared/services/` for cross-module functionality (auth, external APIs). Use module services only for domain-specific logic.
- **Services vs Repositories**: Services handle external integrations, authentication, utilities. Repositories handle database operations.
- **Error Handling**: Always use CustomError with translation keys
- **Dependency Injection**: Constructor injection at route level
- **Type Safety**: Use 4 generic types for Controllers: `<ITranslation, TBody, TParams, TQuery>`
- **Configuration**: Use #src/contexts/configuration.md for environment setup
- **Testing**: Follow #src/contexts/testing.md patterns and maintain 100% coverage
- **Translations**: All user-facing messages must support custom translation system

### 9. Service Location Rules

```typescript
// ✅ Shared services (cross-module)
import { JWTAuthService } from "@src/shared/services/JWTAuthService";
import { UserService } from "@src/shared/services/UserService";

// ✅ Module-specific services (rare)
import { PaymentService } from "@modules/payment/services/PaymentService";

// ✅ Service interfaces (always in module types)
import { IAuthService } from "@modules/auth/types/IAuthService";
```

**Remember**: Consistency is key. Follow existing patterns rather than creating new ones. Always read the relevant context documents before coding.
