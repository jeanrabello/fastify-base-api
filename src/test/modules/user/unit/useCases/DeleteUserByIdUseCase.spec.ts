import { DeleteUserByIdUseCase } from "@modules/user/useCases/DeleteUserByIdUseCase";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import { existingUser } from "../../mocks/entities/User.mock";
import CustomError from "@src/shared/classes/CustomError";

describe("DeleteUserByIdUseCase", () => {
  let useCase: DeleteUserByIdUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new DeleteUserByIdUseCase({ userRepository });
  });

  it("Should delete user successfully", async () => {
    const userId = "existing-user-id";
    userRepository.findById.mockResolvedValue(existingUser);
    userRepository.delete.mockResolvedValue(true);

    const result = await useCase.execute(userId);

    expect(userRepository.delete).toHaveBeenCalledWith(userId);
    expect(result).toBe(true);
  });

  it("Should throw error when user not deleted", async () => {
    const userId = "non-existing-user-id";
    const result = await useCase.execute(userId);

    expect(userRepository.delete).toHaveBeenCalledWith(userId);
    expect(result).toBe(false);
  });

  it("Should throw error when userId not specified", async () => {
    const userId = null;
    await expect(useCase.execute(userId as any)).rejects.toEqual(
      new CustomError("shared.error.requiredFields", 400),
    );
  });

  it("Should handle delete error", async () => {
    const userId = "existing-user-id";
    userRepository.findById.mockResolvedValue(existingUser);
    userRepository.delete.mockResolvedValue(false);

    const result = await useCase.execute(userId);

    expect(result).toBe(false);
  });

  it("Should throw access forbidden when currentUserId is different from id", async () => {
    const userId = "existing-user-id";
    const currentUserId = "different-user-id";
    userRepository.findById.mockResolvedValue(existingUser);

    await expect(useCase.execute(userId, currentUserId)).rejects.toEqual(
      new CustomError("shared.error.accessForbidden", 403),
    );
  });
});
