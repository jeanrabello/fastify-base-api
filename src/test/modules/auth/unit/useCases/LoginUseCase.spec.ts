import { LoginUseCase } from "@modules/auth/useCases/LoginUseCase";
import { LoginRequestModel } from "@modules/auth/models/Request/LoginRequest.model";
import { mockUser, mockLoginResponse } from "../../mocks";
import CustomError from "@src/shared/classes/CustomError";
import { IAuthService, IUserService } from "@src/shared/types/services";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let authService: jest.Mocked<IAuthService>;
  let userService: jest.Mocked<IUserService>;

  beforeEach(() => {
    authService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      getTokenExpirationTime: jest.fn(),
    } as unknown as jest.Mocked<IAuthService>;

    userService = {
      findUserByEmail: jest.fn(),
      verifyPassword: jest.fn(),
      verifyUserCredentials: jest.fn(),
    } as unknown as jest.Mocked<IUserService>;

    useCase = new LoginUseCase({ authService, userService });
  });

  describe("Successful execution", () => {
    it("Should return login response with tokens when credentials are valid", async () => {
      const loginRequest: LoginRequestModel = {
        email: mockUser.email,
        password: "password123",
      };

      userService.verifyUserCredentials.mockResolvedValue(mockUser);
      authService.generateToken.mockReturnValue(mockLoginResponse.accessToken);
      authService.generateRefreshToken.mockReturnValue(
        mockLoginResponse.refreshToken,
      );
      authService.getTokenExpirationTime = jest.fn().mockReturnValue(900);

      const result = await useCase.execute(loginRequest);

      expect(userService.verifyUserCredentials).toHaveBeenCalledWith(
        loginRequest.email,
        loginRequest.password,
      );
      expect(authService.generateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.username,
      });
      expect(authService.generateRefreshToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.username,
      });

      expect(result).toEqual({
        accessToken: mockLoginResponse.accessToken,
        refreshToken: mockLoginResponse.refreshToken,
        expiresIn: 900,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.username,
        },
      });
    });
  });

  describe("Error scenarios", () => {
    it("Should throw CustomError when required fields are missing", async () => {
      const loginRequest = {} as LoginRequestModel;
      const expectedError = new CustomError("shared.error.requiredFields", 400);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });

    it("Should throw CustomError when email is missing", async () => {
      const loginRequest: LoginRequestModel = {
        email: "",
        password: "password123",
      };
      const expectedError = new CustomError("shared.error.requiredFields", 400);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });

    it("Should throw CustomError when password is missing", async () => {
      const loginRequest: LoginRequestModel = {
        email: mockUser.email,
        password: "",
      };
      const expectedError = new CustomError("shared.error.requiredFields", 400);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });

    it("Should throw CustomError when user credentials are invalid", async () => {
      const loginRequest: LoginRequestModel = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const expectedError = new CustomError<IAuthTranslation>(
        "auth.login.invalidCredentials",
        401,
      );

      userService.verifyUserCredentials.mockResolvedValue(null);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });

    it("Should throw error when userService.verifyUserCredentials throws", async () => {
      const loginRequest: LoginRequestModel = {
        email: mockUser.email,
        password: "password123",
      };
      const expectedError = new CustomError<IAuthTranslation>(
        "shared.error.internalServerError",
        500,
      );
      userService.verifyUserCredentials.mockRejectedValue(expectedError);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
