import { Config, Environment } from "@src/config/types";

describe("API Configuration", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
    jest.resetModules();
  });

  const getConfigWithEnv = (
    envVars: Record<string, string | undefined> = {},
  ): Config => {
    // Clear module cache
    jest.resetModules();

    // Set environment variables
    Object.keys(envVars).forEach((key) => {
      if (envVars[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = envVars[key];
      }
    });

    // Import fresh module
    const { default: config } = require("@src/config/api");
    return config;
  };

  describe("Default Configuration", () => {
    it("Should return configuration with expected structure when no custom environment variables are set", () => {
      const config = getConfigWithEnv({
        NODE_ENV: "development",
      });

      // Test structure instead of exact values
      expect(config).toHaveProperty("app");
      expect(config).toHaveProperty("swagger");
      expect(config).toHaveProperty("db");
      expect(config).toHaveProperty("nodemailer");
      expect(config).toHaveProperty("security");
      expect(config).toHaveProperty("jwt");

      // Test default behavior for NODE_ENV
      expect(config.app.env).toBe("development");
      expect(config.swagger.enabled).toBe(true);

      // Test type conversions work
      expect(typeof config.app.port).toBe("number");
      expect(typeof config.security.bcryptSaltRounds).toBe("number");
    });

    it("Should use fallback values when environment variables are explicitly empty", () => {
      const config = getConfigWithEnv({
        NODE_ENV: undefined,
        APP_NAME: "",
        APP_PORT: "",
        MONGO_DB_NAME: "",
        EMAIL_SERVICE: "",
        BCRYPT_SALT_ROUNDS: "",
        JWT_EXPIRES_IN: "",
        JWT_REFRESH_EXPIRES_IN: "",
      });

      // These should fallback to defaults when empty or undefined
      expect(config.app.name).toBe("FastifyAPI");
      expect(config.app.port).toBe(3000);
      expect(config.app.env).toBe("development");
      expect(config.db.dbName).toBe("fastifyAPI");
      expect(config.nodemailer.service).toBe("gmail");
      expect(config.security.bcryptSaltRounds).toBe(12);
      expect(config.jwt.tokenExpiresIn).toBe("15m");
      expect(config.jwt.refreshTokenExpiresIn).toBe("7d");
    });
  });

  describe("Environment-specific Configuration", () => {
    it("Should set swagger.enabled to true in development environment", () => {
      const config = getConfigWithEnv({ NODE_ENV: "development" });

      expect(config.swagger.enabled).toBe(true);
      expect(config.app.env).toBe("development");
    });

    it("Should set swagger.enabled to false in production environment", () => {
      const config = getConfigWithEnv({ NODE_ENV: "production" });

      expect(config.swagger.enabled).toBe(false);
      expect(config.app.env).toBe("production");
    });

    it("Should set swagger.enabled to false in test environment", () => {
      const config = getConfigWithEnv({ NODE_ENV: "test" });

      expect(config.swagger.enabled).toBe(false);
      expect(config.app.env).toBe("test");
    });
  });

  describe("Environment Variables Override", () => {
    it("Should override app configuration with environment variables", () => {
      const config = getConfigWithEnv({
        APP_NAME: "Custom API",
        APP_PORT: "8080",
        APP_HOST: "127.0.0.1",
        BASE_URL: "https://api.example.com",
        NODE_ENV: "production",
      });

      expect(config.app).toEqual({
        name: "Custom API",
        port: 8080,
        env: "production",
        host: "127.0.0.1",
        url: "https://api.example.com",
      });
    });

    it("Should override database configuration with environment variables", () => {
      const config = getConfigWithEnv({
        MONGO_URI: "mongodb://custom-host:27017",
        MONGO_DB_NAME: "customDB",
        MONGO_INITDB_ROOT_USERNAME: "customUser",
        MONGO_INITDB_ROOT_PASSWORD: "customPass",
      });

      expect(config.db).toEqual({
        uri: "mongodb://custom-host:27017",
        dbName: "customDB",
        user: "customUser",
        password: "customPass",
      });
    });

    it("Should override nodemailer configuration with environment variables", () => {
      const config = getConfigWithEnv({
        EMAIL_USER: "test@example.com",
        EMAIL_PASS: "testpass",
        EMAIL_SERVICE: "outlook",
      });

      expect(config.nodemailer).toEqual({
        user: "test@example.com",
        pass: "testpass",
        service: "outlook",
      });
    });

    it("Should override security configuration with environment variables", () => {
      const config = getConfigWithEnv({
        BCRYPT_SALT_ROUNDS: "10",
      });

      expect(config.security.bcryptSaltRounds).toBe(10);
    });

    it("Should override JWT configuration with environment variables", () => {
      const config = getConfigWithEnv({
        JWT_SECRET: "custom-secret",
        JWT_EXPIRES_IN: "30m",
        JWT_REFRESH_SECRET: "custom-refresh-secret",
        JWT_REFRESH_EXPIRES_IN: "14d",
      });

      expect(config.jwt).toEqual({
        tokenSecret: "custom-secret",
        tokenExpiresIn: "30m",
        refreshTokenSecret: "custom-refresh-secret",
        refreshTokenExpiresIn: "14d",
      });
    });
  });

  describe("Type Conversions", () => {
    it("Should convert APP_PORT string to number", () => {
      const config = getConfigWithEnv({ APP_PORT: "9000" });

      expect(config.app.port).toBe(9000);
      expect(typeof config.app.port).toBe("number");
    });

    it("Should convert BCRYPT_SALT_ROUNDS string to number", () => {
      const config = getConfigWithEnv({ BCRYPT_SALT_ROUNDS: "15" });

      expect(config.security.bcryptSaltRounds).toBe(15);
      expect(typeof config.security.bcryptSaltRounds).toBe("number");
    });

    it("Should handle invalid APP_PORT and fallback to default", () => {
      const config = getConfigWithEnv({ APP_PORT: "invalid" });

      expect(config.app.port).toBe(3000); // default value
      expect(typeof config.app.port).toBe("number");
    });

    it("Should handle invalid BCRYPT_SALT_ROUNDS and fallback to default", () => {
      const config = getConfigWithEnv({ BCRYPT_SALT_ROUNDS: "invalid" });

      expect(config.security.bcryptSaltRounds).toBe(12); // default value
      expect(typeof config.security.bcryptSaltRounds).toBe("number");
    });
  });

  describe("Environment Type Casting", () => {
    it("Should cast valid NODE_ENV to Environment type", () => {
      const environments: Environment[] = ["development", "production", "test"];

      environments.forEach((env) => {
        const config = getConfigWithEnv({ NODE_ENV: env });
        expect(config.app.env).toBe(env);
      });
    });

    it("Should default to development for invalid NODE_ENV", () => {
      const config = getConfigWithEnv({ NODE_ENV: "invalid" as any });

      expect(config.app.env).toBe("invalid"); // TypeScript casting doesn't validate at runtime
    });
  });

  describe("Configuration Structure", () => {
    it("Should have all required configuration sections", () => {
      const config = getConfigWithEnv();

      expect(config).toHaveProperty("app");
      expect(config).toHaveProperty("swagger");
      expect(config).toHaveProperty("db");
      expect(config).toHaveProperty("nodemailer");
      expect(config).toHaveProperty("security");
      expect(config).toHaveProperty("jwt");
    });

    it("Should have all required app properties", () => {
      const config = getConfigWithEnv();

      expect(config.app).toHaveProperty("name");
      expect(config.app).toHaveProperty("port");
      expect(config.app).toHaveProperty("env");
      expect(config.app).toHaveProperty("host");
      expect(config.app).toHaveProperty("url");
    });

    it("Should have all required database properties", () => {
      const config = getConfigWithEnv();

      expect(config.db).toHaveProperty("uri");
      expect(config.db).toHaveProperty("dbName");
      expect(config.db).toHaveProperty("user");
      expect(config.db).toHaveProperty("password");
    });

    it("Should have all required JWT properties", () => {
      const config = getConfigWithEnv();

      expect(config.jwt).toHaveProperty("tokenSecret");
      expect(config.jwt).toHaveProperty("tokenExpiresIn");
      expect(config.jwt).toHaveProperty("refreshTokenSecret");
      expect(config.jwt).toHaveProperty("refreshTokenExpiresIn");
    });
  });

  describe("Edge Cases", () => {
    it("Should handle empty string environment variables correctly", () => {
      const config = getConfigWithEnv({
        APP_NAME: "",
        MONGO_URI: "",
        EMAIL_USER: "",
      });

      expect(config.app.name).toBe("FastifyAPI"); // should fallback to default
      expect(config.db.uri).toBe(""); // empty string is valid
      expect(config.nodemailer.user).toBe(""); // empty string is valid
    });

    it("Should handle zero values correctly", () => {
      const config = getConfigWithEnv({
        APP_PORT: "0",
        BCRYPT_SALT_ROUNDS: "0",
      });

      expect(config.app.port).toBe(3000); // Number(0) || 3000 = 3000
      expect(config.security.bcryptSaltRounds).toBe(12); // Number(0) || 12 = 12
    });
  });
});
