import { RefreshTokenUseCase } from "@modules/auth/useCases/RefreshTokenUseCase";
import { mockTokenPayload } from "../../mocks";
import CustomError from "@src/shared/classes/CustomError";
import { IAuthService } from "@src/shared/types/services";

describe("RefreshTokenUseCase", () => {
  let useCase: RefreshTokenUseCase;
  let authService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    authService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      getTokenExpirationTime: jest.fn(),
    } as unknown as jest.Mocked<IAuthService>;

    useCase = new RefreshTokenUseCase({ authService });
  });

  describe("Successful execution", () => {
    it("Should return new tokens when refresh token is valid", async () => {
      const refreshToken = "valid.refresh.token";

      authService.verifyRefreshToken.mockReturnValue(mockTokenPayload);
      authService.generateToken.mockReturnValue("new.access.token");
      authService.generateRefreshToken.mockReturnValue("new.refresh.token");
      authService.getTokenExpirationTime = jest.fn().mockReturnValue(900);

      const result = await useCase.execute(refreshToken);

      expect(authService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(authService.generateToken).toHaveBeenCalledWith({
        id: mockTokenPayload.id,
        email: mockTokenPayload.email,
      });
      expect(authService.generateRefreshToken).toHaveBeenCalledWith({
        id: mockTokenPayload.id,
        email: mockTokenPayload.email,
      });

      expect(result).toEqual({
        accessToken: "new.access.token",
        refreshToken: "new.refresh.token",
        expiresIn: 900,
      });
    });
  });

  describe("Error scenarios", () => {
    it("Should throw CustomError when refresh token is missing", async () => {
      const refreshToken = null as any;

      await expect(useCase.execute(refreshToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        "shared.error.requiredFields",
      );
    });

    it("Should throw CustomError when refresh token is empty", async () => {
      const refreshToken = "";

      await expect(useCase.execute(refreshToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        "shared.error.requiredFields",
      );
    });

    it("Should throw CustomError when refresh token is invalid", async () => {
      const refreshToken = "invalid.refresh.token";

      authService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("Invalid or expired refresh token");
      });

      await expect(useCase.execute(refreshToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        "auth.refreshToken.invalidToken",
      );
    });

    it("Should throw CustomError when refresh token is expired", async () => {
      const refreshToken = "expired.refresh.token";

      authService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("jwt expired");
      });

      await expect(useCase.execute(refreshToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        "auth.refreshToken.invalidToken",
      );
    });

    it("Should throw CustomError when refresh token format is invalid", async () => {
      const refreshToken = "malformed-refresh-token";

      authService.verifyRefreshToken.mockImplementation(() => {
        throw new Error("jwt malformed");
      });

      await expect(useCase.execute(refreshToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        "auth.refreshToken.invalidToken",
      );
    });

    it("Should handle authService.generateToken throwing error", async () => {
      const refreshToken = "valid.refresh.token";

      authService.verifyRefreshToken.mockReturnValue(mockTokenPayload);
      authService.generateToken.mockImplementation(() => {
        throw new Error("Token generation failed");
      });

      await expect(useCase.execute(refreshToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        "auth.refreshToken.invalidToken",
      );
    });

    it("Should handle authService.generateRefreshToken throwing error", async () => {
      const refreshToken = "valid.refresh.token";

      authService.verifyRefreshToken.mockReturnValue(mockTokenPayload);
      authService.generateToken.mockReturnValue("new.access.token");
      authService.generateRefreshToken.mockImplementation(() => {
        throw new Error("Refresh token generation failed");
      });

      await expect(useCase.execute(refreshToken)).rejects.toThrow(CustomError);
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        "auth.refreshToken.invalidToken",
      );
    });
  });
});
