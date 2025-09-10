import { ValidateTokenUseCase } from "@modules/auth/useCases/ValidateTokenUseCase";
import { mockTokenPayload } from "../../mocks";
import CustomError from "@src/shared/classes/CustomError";
import { IAuthService } from "@modules/auth/types/IAuthService";

describe("ValidateTokenUseCase", () => {
  let useCase: ValidateTokenUseCase;
  let authService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    authService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      getTokenExpirationTime: jest.fn(),
    } as unknown as jest.Mocked<IAuthService>;

    useCase = new ValidateTokenUseCase({ authService });
  });

  describe("Successful execution", () => {
    it("Should return valid response when token is valid", async () => {
      const validateToken = "valid.jwt.token";

      authService.verifyToken.mockReturnValue(mockTokenPayload);

      const result = await useCase.execute(validateToken);

      expect(authService.verifyToken).toHaveBeenCalledWith(validateToken);
      expect(authService.verifyToken).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        valid: true,
        user: {
          id: mockTokenPayload.id,
          email: mockTokenPayload.email,
          name: mockTokenPayload.name,
        },
      });
    });
  });

  describe("Error scenarios", () => {
    it("Should throw CustomError when token is missing", async () => {
      const validateToken = null as any;

      await expect(useCase.execute(validateToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(validateToken)).rejects.toThrow(
        "shared.error.requiredFields",
      );
    });

    it("Should throw CustomError when token is empty", async () => {
      const validateToken = "";

      await expect(useCase.execute(validateToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(validateToken)).rejects.toThrow(
        "shared.error.requiredFields",
      );
    });

    it("Should throw CustomError when token is invalid", async () => {
      const validateToken = "invalid.jwt.token";

      authService.verifyToken.mockImplementation(() => {
        throw new Error("Invalid or expired token");
      });

      await expect(useCase.execute(validateToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(validateToken)).rejects.toThrow(
        "auth.validateToken.invalidToken",
      );
    });

    it("Should throw CustomError when token is expired", async () => {
      const validateToken = "expired.jwt.token";
      authService.verifyToken.mockImplementation(() => {
        throw new Error("jwt expired");
      });

      await expect(useCase.execute(validateToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(validateToken)).rejects.toThrow(
        "auth.validateToken.invalidToken",
      );
    });

    it("Should throw CustomError when token format is invalid", async () => {
      const validateToken = "malformed.jwt.token";

      authService.verifyToken.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await expect(useCase.execute(validateToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(validateToken)).rejects.toThrow(
        "auth.validateToken.invalidToken",
      );
    });
  });
});
