import { LoginUseCase } from "@modules/auth/useCases/LoginUseCase";
import { LoginRequestModel } from "@modules/auth/models/Request/LoginRequest.model";
import { mockCredential, mockLoginResponse } from "../../mocks";
import CustomError from "@src/shared/classes/CustomError";
import { IAuthService } from "@src/shared/types/services";
import { IAuthTranslation } from "@modules/auth/types/IAuthTranslation";
import { ICredentialRepository } from "@modules/auth/types/ICredentialRepository";
import { comparePassword } from "@src/shared/utils";

jest.mock("@src/shared/utils", () => ({
  ...jest.requireActual("@src/shared/utils"),
  comparePassword: jest.fn(),
}));

const mockedComparePassword = comparePassword as jest.MockedFunction<
  typeof comparePassword
>;

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let authService: jest.Mocked<IAuthService>;
  let credentialRepository: jest.Mocked<ICredentialRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      getTokenExpirationTime: jest.fn(),
    } as unknown as jest.Mocked<IAuthService>;

    credentialRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      updateEmail: jest.fn(),
      deleteByUserId: jest.fn(),
    } as jest.Mocked<ICredentialRepository>;

    useCase = new LoginUseCase({ authService, credentialRepository });
  });

  describe("Successful execution", () => {
    it("Should return login response with tokens when credentials are valid", async () => {
      const loginRequest: LoginRequestModel = {
        email: mockCredential.email,
        password: "password123",
      };

      credentialRepository.findByEmail.mockResolvedValue(mockCredential);
      mockedComparePassword.mockResolvedValue(true);
      authService.generateToken.mockReturnValue(mockLoginResponse.accessToken);
      authService.generateRefreshToken.mockReturnValue(
        mockLoginResponse.refreshToken,
      );
      authService.getTokenExpirationTime = jest.fn().mockReturnValue(900);

      const result = await useCase.execute(loginRequest);

      expect(credentialRepository.findByEmail).toHaveBeenCalledWith(
        loginRequest.email,
      );
      expect(mockedComparePassword).toHaveBeenCalledWith(
        loginRequest.password,
        mockCredential.secretData,
      );
      expect(authService.generateToken).toHaveBeenCalledWith({
        id: mockCredential.userId,
        email: mockCredential.email,
      });
      expect(authService.generateRefreshToken).toHaveBeenCalledWith({
        id: mockCredential.userId,
        email: mockCredential.email,
      });

      expect(result).toEqual({
        accessToken: mockLoginResponse.accessToken,
        refreshToken: mockLoginResponse.refreshToken,
        expiresIn: 900,
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
        email: mockCredential.email,
        password: "",
      };
      const expectedError = new CustomError("shared.error.requiredFields", 400);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });

    it("Should throw CustomError when credential is not found", async () => {
      const loginRequest: LoginRequestModel = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const expectedError = new CustomError<IAuthTranslation>(
        "auth.login.invalidCredentials",
        401,
      );

      credentialRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });

    it("Should throw CustomError when password is invalid", async () => {
      const loginRequest: LoginRequestModel = {
        email: mockCredential.email,
        password: "wrongpassword",
      };

      const expectedError = new CustomError<IAuthTranslation>(
        "auth.login.invalidCredentials",
        401,
      );

      credentialRepository.findByEmail.mockResolvedValue(mockCredential);
      mockedComparePassword.mockResolvedValue(false);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });

    it("Should throw error when credentialRepository.findByEmail throws", async () => {
      const loginRequest: LoginRequestModel = {
        email: mockCredential.email,
        password: "password123",
      };
      const expectedError = new CustomError<IAuthTranslation>(
        "shared.error.internalServerError",
        500,
      );
      credentialRepository.findByEmail.mockRejectedValue(expectedError);

      await expect(useCase.execute(loginRequest)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
