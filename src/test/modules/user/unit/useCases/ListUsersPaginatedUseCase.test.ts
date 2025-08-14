import { ListUsersPaginatedUseCase } from "@modules/user/useCases/ListUsersPaginatedUseCase";
import { IUserRepository } from "@modules/user/types/IUserRepository";
import {
  mockPaginatedUsers,
  mockPaginationParams,
  emptyPaginatedUsers,
} from "../../../user/mocks/models/ListUsersPaginated.mock";

describe("ListUsersPaginatedUseCase", () => {
  let useCase: ListUsersPaginatedUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = {
      findPaginated: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    useCase = new ListUsersPaginatedUseCase({ userRepository });
  });

  it("should return paginated users successfully", async () => {
    userRepository.findPaginated.mockResolvedValue(mockPaginatedUsers);

    const result = await useCase.execute(mockPaginationParams);

    expect(userRepository.findPaginated).toHaveBeenCalledWith(
      mockPaginationParams,
    );
    expect(result).toEqual(mockPaginatedUsers);
  });

  it("should return empty result when no users found", async () => {
    userRepository.findPaginated.mockResolvedValue(emptyPaginatedUsers);

    const result = await useCase.execute(mockPaginationParams);

    expect(userRepository.findPaginated).toHaveBeenCalledWith(
      mockPaginationParams,
    );
    expect(result.content).toHaveLength(0);
    expect(result.totalItems).toBe(0);
  });

  it("should handle repository error", async () => {
    const error = new Error("Database error");
    userRepository.findPaginated.mockRejectedValue(error);

    await expect(useCase.execute(mockPaginationParams)).rejects.toThrow(error);
  });

  it("should throw CustomError when repository returns null", async () => {
    userRepository.findPaginated.mockResolvedValue(null as any);

    await expect(useCase.execute(mockPaginationParams)).rejects.toThrow(
      expect.objectContaining({
        message: "user.listUsers.error",
        statusCode: 500,
      }),
    );
  });
});
