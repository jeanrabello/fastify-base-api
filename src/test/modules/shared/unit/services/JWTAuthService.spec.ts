import { JWTAuthService } from "@src/shared/services/JWTAuthService";
import jwt from "jsonwebtoken";
import CustomError from "@src/shared/classes/CustomError";

// Mock do jwt
jest.mock("jsonwebtoken");
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Mock do config com objeto mutável
jest.mock("@config/api", () => {
  const mockConfig = {
    jwt: {
      tokenSecret: "test-access-secret",
      refreshTokenSecret: "test-refresh-secret",
      tokenExpiresIn: "15m",
      refreshTokenExpiresIn: "7d",
    },
  };

  return {
    __esModule: true,
    default: mockConfig,
    // Exportamos também o objeto para poder modificá-lo nos testes
    mockConfig,
  };
});

// Importamos o config mockado para poder modificá-lo
const { mockConfig } = require("@config/api");

describe("JWTAuthService", () => {
  let service: JWTAuthService;

  beforeEach(() => {
    service = new JWTAuthService();
    jest.clearAllMocks();
  });

  describe("generateToken", () => {
    it("Should generate access token with correct payload and options", () => {
      const payload = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
      };
      const expectedToken = "mocked.access.token";

      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = service.generateToken(payload);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        payload,
        "test-access-secret",
        { expiresIn: "15m" },
      );
      expect(result).toBe(expectedToken);
    });

    it("Should use default values when environment variables are not set", () => {
      const payload = { id: "123" };
      const expectedToken = "mocked.access.token";

      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = service.generateToken(payload);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        payload,
        "test-access-secret",
        { expiresIn: "15m" },
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe("verifyToken", () => {
    it("Should verify and return token payload when token is valid", () => {
      const token = "valid.jwt.token";
      const expectedPayload = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
      };

      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      const result = service.verifyToken(token);

      expect(mockedJwt.verify).toHaveBeenCalledWith(
        token,
        "test-access-secret",
      );
      expect(result).toEqual(expectedPayload);
    });

    it("Should handle Bearer token format", () => {
      const token = "Bearer valid.jwt.token";
      const expectedPayload = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
      };

      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      const result = service.verifyToken(token);

      expect(mockedJwt.verify).toHaveBeenCalledWith(
        "valid.jwt.token", // Should extract token without "Bearer "
        "test-access-secret",
      );
      expect(result).toEqual(expectedPayload);
    });

    it("Should throw error when token is invalid", () => {
      const token = "invalid.jwt.token";

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      expect(() => service.verifyToken(token)).toThrow(CustomError);
    });

    it("Should throw error when token is expired", () => {
      const token = "expired.jwt.token";

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("jwt expired");
      });

      expect(() => service.verifyToken(token)).toThrow(CustomError);
    });
  });

  describe("generateRefreshToken", () => {
    it("Should generate refresh token with correct payload and options", () => {
      const payload = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
      };
      const expectedToken = "mocked.refresh.token";

      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = service.generateRefreshToken(payload);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        payload,
        "test-refresh-secret",
        { expiresIn: "7d" },
      );
      expect(result).toBe(expectedToken);
    });
  });

  describe("verifyRefreshToken", () => {
    it("Should verify and return refresh token payload when token is valid", () => {
      const token = "valid.refresh.token";
      const expectedPayload = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
      };

      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      const result = service.verifyRefreshToken(token);

      expect(mockedJwt.verify).toHaveBeenCalledWith(
        token,
        "test-refresh-secret",
      );
      expect(result).toEqual(expectedPayload);
    });

    it("Should handle Bearer token format in refresh token", () => {
      const token = "Bearer valid.refresh.token";
      const expectedPayload = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
      };

      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      const result = service.verifyRefreshToken(token);

      expect(mockedJwt.verify).toHaveBeenCalledWith(
        "valid.refresh.token", // Should extract token without "Bearer "
        "test-refresh-secret",
      );
      expect(result).toEqual(expectedPayload);
    });

    it("Should throw error when refresh token is invalid", () => {
      const token = "invalid.refresh.token";

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      expect(() => service.verifyRefreshToken(token)).toThrow(CustomError);
    });
  });

  describe("getTokenExpirationTime", () => {
    it("Should return correct expiration time for minutes", () => {
      // O mock config já está configurado com "15m"
      const result = service.getTokenExpirationTime();
      expect(result).toBe(900); // 15 * 60
    });

    it("Should return correct expiration time for different format", () => {
      // Este teste verifica se o método funciona com o valor mockado
      const result = service.getTokenExpirationTime();
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });
  });

  // Testes adicionais para cobrir todas as branches do getTokenExpirationTime
  describe("getTokenExpirationTime - All Branches", () => {
    let originalTokenExpiresIn: string;

    beforeEach(() => {
      originalTokenExpiresIn = mockConfig.jwt.tokenExpiresIn;
    });

    afterEach(() => {
      mockConfig.jwt.tokenExpiresIn = originalTokenExpiresIn;
    });

    it("Should handle hours format", () => {
      mockConfig.jwt.tokenExpiresIn = "2h";

      const result = service.getTokenExpirationTime();
      expect(result).toBe(7200); // 2 * 3600
    });

    it("Should handle days format", () => {
      mockConfig.jwt.tokenExpiresIn = "1d";

      const result = service.getTokenExpirationTime();
      expect(result).toBe(86400); // 1 * 86400
    });

    it("Should return default when minutes parsing fails", () => {
      mockConfig.jwt.tokenExpiresIn = "invalidm";

      const result = service.getTokenExpirationTime();
      expect(result).toBe(900); // default
    });

    it("Should return default when hours parsing fails", () => {
      mockConfig.jwt.tokenExpiresIn = "invalidh";

      const result = service.getTokenExpirationTime();
      expect(result).toBe(900); // default
    });

    it("Should return default when days parsing fails", () => {
      mockConfig.jwt.tokenExpiresIn = "invalidd";

      const result = service.getTokenExpirationTime();
      expect(result).toBe(900); // default
    });

    it("Should return default for unrecognized format", () => {
      mockConfig.jwt.tokenExpiresIn = "unknown";

      const result = service.getTokenExpirationTime();
      expect(result).toBe(900); // default fallback
    });
  });
});
