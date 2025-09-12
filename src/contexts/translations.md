# Translations Development Guide

## Overview

The translation system provides custom internationalization support for API responses, error messages, and user-facing content. It uses a type-safe approach with TypeScript interfaces to ensure translation keys are validated at compile time.

## Architecture Pattern

### Translation Interface Structure

Each module defines its own translation interface that extends the base `Translation` interface:

```typescript
import { Translation } from "@src/shared/types/lang";

export interface I{ModuleName}Translation extends Translation {
  {moduleName}: {
    {action1}: {
      success: string;
      error: string;
      specificMessage: string;
    };
    {action2}: {
      success: string;
      notFound: string;
      error: string;
    };
    // Add more actions as needed
  };
}
```

### Translation Implementation Template

```typescript
// en-us.ts
import { I{ModuleName}Translation } from "../types/I{ModuleName}Translation";

const enUs: I{ModuleName}Translation = {
  shared: {
    error: {
      invalidFields: "Invalid fields",
      requiredFields: "Required fields not filled",
      tokenExpired: "Token expired",
      tokenNotFound: "Token not found",
      internalServerError: "Internal server error",
      noMessageSpecified: "No message specified",
    },
  },
  {moduleName}: {
    {action1}: {
      success: "{ModuleName} {action1} successful!",
      error: "Error during {moduleName} {action1}",
      specificMessage: "Specific message for this action",
    },
    {action2}: {
      success: "{ModuleName} {action2} successful!",
      notFound: "{ModuleName} not found",
      error: "Error during {moduleName} {action2}",
    },
  },
};

export default enUs;
```

## Real-World Example: User Module

### Interface Definition

```typescript
// src/modules/user/types/IUserTranslation.ts
import { Translation } from "@src/shared/types/lang";

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
    };
    updateUserEmail: {
      notFound: string;
      emailAlreadyRegistered: string;
      error: string;
      updated: string;
    };
    listUsers: {
      success: string;
      error: string;
    };
  };
}
```

### English Implementation

```typescript
// src/modules/user/lang/en-us.ts
import { IUserTranslation } from "../types/IUserTranslation";

const enUs: IUserTranslation = {
  shared: {
    error: {
      invalidFields: "Invalid fields",
      requiredFields: "Required fields not filled",
      tokenExpired: "Token expired",
      tokenNotFound: "Token not found",
      internalServerError: "Internal server error",
      noMessageSpecified: "No message specified",
    },
  },
  user: {
    createUser: {
      created: "User created successfully!",
      error: "Error creating user",
      emailAlreadyRegistered: "Email already registered",
    },
    findUser: {
      notFound: "User not found",
      found: "User found",
    },
    deleteUser: {
      deleted: "User deleted successfully",
      notFound: "User not found",
      error: "Error deleting user",
    },
    updateUserEmail: {
      notFound: "User not found",
      emailAlreadyRegistered: "Email already registered",
      error: "Error updating user email",
      updated: "User email updated successfully",
    },
    listUsers: {
      success: "Users retrieved successfully",
      error: "Error retrieving users",
    },
  },
};

export default enUs;
```

### Portuguese Implementation

```typescript
// src/modules/user/lang/pt-br.ts
import { IUserTranslation } from "../types/IUserTranslation";

const ptBr: IUserTranslation = {
  shared: {
    error: {
      invalidFields: "Campos inválidos",
      requiredFields: "Campos obrigatórios não preenchidos",
      tokenExpired: "Token expirado",
      tokenNotFound: "Token não encontrado",
      internalServerError: "Erro interno do servidor",
      noMessageSpecified: "Nenhuma mensagem especificada",
    },
  },
  user: {
    createUser: {
      created: "Usuário criado com sucesso!",
      error: "Erro ao criar usuário",
      emailAlreadyRegistered: "Email já cadastrado",
    },
    findUser: {
      notFound: "Usuário não encontrado",
      found: "Usuário encontrado",
    },
    deleteUser: {
      deleted: "Usuário excluído com sucesso",
      notFound: "Usuário não encontrado",
      error: "Erro ao excluir usuário",
    },
    updateUserEmail: {
      notFound: "Usuário não encontrado",
      emailAlreadyRegistered: "Email já cadastrado",
      error: "Erro ao atualizar email do usuário",
      updated: "Email do usuário atualizado com sucesso",
    },
    listUsers: {
      success: "Usuários recuperados com sucesso",
      error: "Erro ao recuperar usuários",
    },
  },
};

export default ptBr;
```

### Translation Index File

```typescript
// src/modules/user/lang/index.tsx
export * from "./en-us";
export * from "./pt-br";
```

## Design Principles

### 1. Type Safety

- Use TypeScript interfaces to ensure all translation keys are implemented
- Compile-time validation prevents missing translations
- IDE autocompletion for translation keys

### 2. Hierarchical Structure

- Organize translations by module and action
- Use nested objects for logical grouping
- Consistent naming patterns across modules

### 3. Consistency

- Standard error messages in shared section
- Consistent naming for similar actions across modules
- Same message types for similar operations

### 4. Extensibility

- Easy to add new languages
- Simple to add new message types
- Modular structure for scalability

## Translation Key Patterns

### Success Messages

```typescript
{
  created: "Resource created successfully",
  updated: "Resource updated successfully",
  deleted: "Resource deleted successfully",
  found: "Resource found",
  success: "Operation completed successfully",
}
```

### Error Messages

```typescript
{
  error: "Error performing operation",
  notFound: "Resource not found",
  alreadyExists: "Resource already exists",
  validationError: "Validation failed",
  unauthorized: "Unauthorized access",
  forbidden: "Access forbidden",
}
```

### Specific Domain Messages

```typescript
{
  emailAlreadyRegistered: "Email already registered",
  invalidCredentials: "Invalid username or password",
  accountLocked: "Account has been locked",
  passwordExpired: "Password has expired",
}
```

## Usage in Code

### Controllers

```typescript
// Return success message with translation key
return {
  statusCode: 201,
  message: "user.createUser.created",
  data: user,
};
```

### Use Cases with CustomError

```typescript
// Throw error with translation key
throw new CustomError<IUserTranslation>(
  "user.createUser.emailAlreadyRegistered",
  409,
);

// Shared error message
throw new CustomError("shared.error.requiredFields", 400);
```

### Response Translator Middleware

The middleware automatically translates messages based on the Accept-Language header:

```typescript
// Before translation
{
  statusCode: 201,
  message: "user.createUser.created",
  data: { /* user data */ }
}

// After translation (en-US)
{
  statusCode: 201,
  message: "User created successfully!",
  data: { /* user data */ }
}
```

## Naming Conventions

### File Names

- Interface: `I{ModuleName}Translation.ts`
- Implementation: `{locale}.ts` (e.g., `en-us.ts`, `pt-br.ts`)
- Index: `index.tsx`

### Translation Keys

- Module level: `{moduleName}`
- Action level: `{action}{Entity}` (e.g., `createUser`, `updateUserEmail`)
- Message type: `{messageType}` (e.g., `success`, `error`, `notFound`)

### Examples

```typescript
// Good naming
user.createUser.created;
user.findUser.notFound;
product.updateProduct.success;
order.deleteOrder.error;

// Avoid
user.create.success; // Missing entity name
createUser.success; // Missing module context
user.success; // Too generic
```

## Translation Structure Template

```typescript
export interface I{ModuleName}Translation extends Translation {
  {moduleName}: {
    // Create operations
    create{Entity}: {
      created: string;
      error: string;
      alreadyExists?: string;
      validationError?: string;
    };

    // Read operations
    find{Entity}: {
      found: string;
      notFound: string;
      error: string;
    };

    list{Entity}s: {
      success: string;
      error: string;
      empty?: string;
    };

    // Update operations
    update{Entity}: {
      updated: string;
      notFound: string;
      error: string;
      noChanges?: string;
    };

    // Delete operations
    delete{Entity}: {
      deleted: string;
      notFound: string;
      error: string;
      cannotDelete?: string;
    };

    // Specific domain actions
    {specificAction}: {
      success: string;
      error: string;
      specificMessage?: string;
    };
  };
}
```

## Language Support

### Supported Locales

- `en-US`: English (United States)
- `pt-BR`: Portuguese (Brazil)
- Add more as needed

### Locale Detection

The system uses the `Accept-Language` header to determine the user's preferred language:

```typescript
// Header examples
"Accept-Language": "en-US"
"Accept-Language": "pt-BR"
```

### Fallback Strategy

1. Try exact locale match (e.g., `pt-BR`)
2. Try language match (e.g., `pt`)
3. Fall back to default language (`en-US`)

## File Organization

```
src/modules/{moduleName}/lang/
├── index.tsx                 # Export all translations
├── en-us.ts                 # English implementation
├── pt-br.ts                 # Portuguese implementation
└── {locale}.ts              # Additional languages
```

```
src/modules/{moduleName}/types/
└── I{ModuleName}Translation.ts   # Translation interface
```

## Best Practices

### 1. Message Writing

- Use clear, concise language
- Be consistent with tone and style
- Avoid technical jargon in user messages
- Use active voice when possible

### 2. Cultural Considerations

- Consider cultural differences in messaging
- Use appropriate formality levels
- Account for different date/time formats
- Consider right-to-left languages for future expansion

### 3. Maintenance

- Keep translations in sync across languages
- Use translation keys that won't change often
- Document context for translators
- Regular review and updates

### 4. Testing

- Test all supported languages
- Verify message interpolation works
- Test fallback scenarios
- Validate translation completeness

## Advanced Features

### Context-Specific Messages

Different messages based on context:

```typescript
{
  delete: {
    confirm: "Are you sure you want to delete this user?",
    success: "User deleted successfully",
    cannotDelete: "Cannot delete user with active orders",
  }
}
```

## Integration Testing

Test translation functionality:

```typescript
describe("Translation System", () => {
  it("Should return English message for en-US locale", () => {
    const request = {
      headers: { "accept-language": "en-US" },
      // ... other request properties
    };

    // Test that the correct translation is returned
  });

  it("Should fallback to English for unsupported locale", () => {
    const request = {
      headers: { "accept-language": "fr-FR" },
      // ... other request properties
    };

    // Test fallback behavior
  });
});
```
