# Configuration Guide

## Overview

This guide explains how to configure the Fastify-based API using environment variables, configuration files, and best practices for different environments (development, production, test).

## Configuration Architecture

The configuration system is built with type safety and environment-specific settings:

```
src/config/
├── api.ts          # Main configuration file
├── types.ts        # Configuration type definitions
└── env.ts          # Environment validation (if exists)
```

## Configuration Structure

### Main Configuration File

Located in `src/config/api.ts`:

```typescript
import { Config, Environment } from "./types";

const environment = (process.env.NODE_ENV || "development") as Environment;

const getConfig = (): Config => {
  const config: Config = {
    app: {
      name: process.env.APP_NAME || "FastifyAPI",
      port: Number(process.env.APP_PORT) || 3000,
      env: environment,
      host: process.env.APP_HOST || "127.0.0.1",
      url: process.env.BASE_URL || "http://127.0.0.1:3000",
    },
    swagger: {
      enabled: environment === "development",
    },
    db: {
      uri: process.env.MONGO_URI || "",
      dbName: process.env.MONGO_DB_NAME || "fastifyAPI",
      user: process.env.MONGO_INITDB_ROOT_USERNAME || "root",
      password: process.env.MONGO_INITDB_ROOT_PASSWORD || "root",
    },
    jwt: {
      tokenSecret: process.env.JWT_SECRET || "default-token-secret",
      tokenExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
      refreshTokenSecret:
        process.env.JWT_REFRESH_SECRET || "default-refresh-token-secret",
      refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    },
    security: {
      bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
    },
    nodemailer: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
      service: process.env.EMAIL_SERVICE || "gmail",
    },
  };

  return config;
};

export default getConfig();
```

### Type Definitions

Located in `src/config/types.ts`:

```typescript
export type Environment = "development" | "production" | "test";

export interface Config {
  app: {
    name: string;
    port: number;
    env: Environment;
    host: string;
    url: string;
  };
  swagger: {
    enabled: boolean;
  };
  db: {
    uri: string;
    dbName: string;
    user: string;
    password: string;
  };
  jwt: {
    tokenSecret: string;
    tokenExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
  };
  security: {
    bcryptSaltRounds: number;
  };
  nodemailer: {
    user: string;
    pass: string;
    service: string;
  };
}
```

## Environment Variables

### Required Variables

These variables **must** be set in production:

```bash
# Database
MONGO_URI="mongodb://username:password@host:port/database"
MONGO_DB_NAME="your_database_name"
MONGO_INITDB_ROOT_USERNAME="admin_user"
MONGO_INITDB_ROOT_PASSWORD="secure_password"

# JWT Security
JWT_SECRET="your-super-secure-jwt-secret-key"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="production"
APP_PORT="3000"
BASE_URL="https://your-api-domain.com"
```

### Optional Variables

These have sensible defaults but can be customized:

```bash
# Application
APP_NAME="YourAPIName"
APP_HOST="0.0.0.0"

# Security
BCRYPT_SALT_ROUNDS="12"

# Email (if using email features)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_SERVICE="gmail"
```

## Environment Files

### Development Environment

Create `.env.development`:

```bash
NODE_ENV=development
APP_NAME=FastifyAPI-Dev
APP_PORT=3000
APP_HOST=127.0.0.1
BASE_URL=http://localhost:3000

# Database (local development)
MONGO_URI=mongodb://localhost:27017/fastifyapi_dev
MONGO_DB_NAME=fastifyapi_dev
MONGO_INITDB_ROOT_USERNAME=dev_user
MONGO_INITDB_ROOT_PASSWORD=dev_password

# JWT (development - not secure)
JWT_SECRET=dev-jwt-secret-not-for-production
JWT_REFRESH_SECRET=dev-refresh-secret-not-for-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=10

# Email (optional for development)
EMAIL_USER=test@example.com
EMAIL_PASS=test_password
EMAIL_SERVICE=gmail
```

### Test Environment

Create `.env.test`:

```bash
NODE_ENV=test
APP_NAME=FastifyAPI-Test
APP_PORT=3001
BASE_URL=http://localhost:3001

# Database (test)
MONGO_URI=mongodb://localhost:27017/fastifyapi_test
MONGO_DB_NAME=fastifyapi_test
MONGO_INITDB_ROOT_USERNAME=test_user
MONGO_INITDB_ROOT_PASSWORD=test_password

# JWT (test)
JWT_SECRET=test-jwt-secret
JWT_REFRESH_SECRET=test-refresh-secret
JWT_EXPIRES_IN=5m
JWT_REFRESH_EXPIRES_IN=1h

# Security (faster for tests)
BCRYPT_SALT_ROUNDS=4
```

### Production Environment

```bash
NODE_ENV=production
APP_NAME=FastifyAPI
APP_PORT=3000
APP_HOST=0.0.0.0
BASE_URL=https://api.yourdomain.com

# Database (production)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGO_DB_NAME=fastifyapi_prod
MONGO_INITDB_ROOT_USERNAME=${SECRET_DB_USER}
MONGO_INITDB_ROOT_PASSWORD=${SECRET_DB_PASSWORD}

# JWT (production - use strong secrets)
JWT_SECRET=${SECRET_JWT_KEY}
JWT_REFRESH_SECRET=${SECRET_JWT_REFRESH_KEY}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12

# Email (production)
EMAIL_USER=${SECRET_EMAIL_USER}
EMAIL_PASS=${SECRET_EMAIL_PASSWORD}
EMAIL_SERVICE=gmail
```

## Using Configuration

### In Application Code

```typescript
import config from "@config/api";

// Access configuration values
const port = config.app.port;
const dbUri = config.db.uri;
const jwtSecret = config.jwt.tokenSecret;

// Environment-specific logic
if (config.app.env === "development") {
  console.log("Running in development mode");
}

// Type-safe access
const isSwaggerEnabled: boolean = config.swagger.enabled;
```

### In Services

```typescript
import config from "@config/api";

export class JWTAuthService {
  generateToken(payload: any): string {
    return jwt.sign(payload, config.jwt.tokenSecret, {
      expiresIn: config.jwt.tokenExpiresIn,
    });
  }
}
```

### In Database Connection

```typescript
import config from "@config/api";
import mongoose from "mongoose";

export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.db.uri, {
      dbName: config.db.dbName,
      user: config.db.user,
      pass: config.db.password,
    });
    console.log(`Connected to database: ${config.db.dbName}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
```

## Environment-Specific Behavior

### Development

- Swagger documentation enabled
- Detailed error logging
- Hot reloading
- Local database
- Relaxed security settings

### Test

- Swagger disabled
- Minimal logging
- In-memory or test database
- Fast bcrypt rounds
- Short token expiration

### Production

- Swagger disabled
- Error logging without stack traces
- Production database
- Strong security settings
- Proper secret management

## Configuration Validation

### Runtime Validation

Create environment validation to catch configuration errors early:

```typescript
// src/config/env.ts
import config from "./api";

export const validateEnvironment = (): void => {
  const errors: string[] = [];

  // Required in production
  if (config.app.env === "production") {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.startsWith("default")
    ) {
      errors.push("JWT_SECRET must be set in production");
    }

    if (
      !process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_REFRESH_SECRET.startsWith("default")
    ) {
      errors.push("JWT_REFRESH_SECRET must be set in production");
    }

    if (!config.db.uri) {
      errors.push("MONGO_URI must be set in production");
    }
  }

  // General validation
  if (config.app.port < 1 || config.app.port > 65535) {
    errors.push("APP_PORT must be a valid port number");
  }

  if (config.security.bcryptSaltRounds < 4) {
    errors.push("BCRYPT_SALT_ROUNDS must be at least 4");
  }

  if (errors.length > 0) {
    console.error("Configuration validation errors:");
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
};
```

Use in application startup:

```typescript
// src/server.ts
import { validateEnvironment } from "@config/env";

validateEnvironment();
// Continue with application startup...
```

## Docker Configuration

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - APP_PORT=3000
      - MONGO_URI=mongodb://mongo:27017/fastifyapi
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Environment File for Docker

```bash
# .env (for docker-compose)
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secure-password
```

## Configuration Testing

### Unit Tests

```typescript
import config from "@config/api";

describe("Configuration", () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.APP_PORT;
  });

  it("Should use default values when environment variables are not set", () => {
    expect(config.app.name).toBe("FastifyAPI");
    expect(config.app.port).toBe(3000);
    expect(config.app.env).toBe("development");
  });

  it("Should use environment variables when set", () => {
    process.env.APP_NAME = "TestAPI";
    process.env.APP_PORT = "4000";

    // Re-import to get updated config
    const newConfig = require("@config/api").default;

    expect(newConfig.app.name).toBe("TestAPI");
    expect(newConfig.app.port).toBe(4000);
  });
});
```

## Troubleshooting

### Common Issues

1. **Configuration not updating**: Restart the application after changing environment variables
2. **Type errors**: Ensure environment variables are properly cast (e.g., `Number()` for ports)
3. **Missing secrets**: Check that all required environment variables are set
4. **Database connection fails**: Verify database URI and credentials

This configuration system provides type safety, environment isolation, and security while maintaining flexibility for different deployment scenarios.
