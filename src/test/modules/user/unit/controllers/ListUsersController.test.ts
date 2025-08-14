import { ListUsersController } from "@modules/user/controllers/ListUsersController";
import { ListUsersPaginatedUseCase } from "@modules/user/useCases/ListUsersPaginatedUseCase";
import enUs from "@modules/user/lang/en-us";
import { IUserTranslation } from "@modules/user/types/IUserTranslation";
import { HttpRequest } from "@src/shared/types/http";
import {
  mockPaginatedUsers,
  mockPaginationParams,
} from "../../../user/mocks/models/ListUsersPaginated.mock";

describe("ListUsersController", () => {
  let controller: ListUsersController;
  let useCase: jest.Mocked<ListUsersPaginatedUseCase>;
  const languagePack = enUs as IUserTranslation;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListUsersPaginatedUseCase>;
    controller = new ListUsersController({ listUsersUseCase: useCase });
  });

  it("should return 200 with paginated users", async () => {
    useCase.execute.mockResolvedValue(mockPaginatedUsers);

    const req = {
      query: { page: 1, size: 10 },
      languagePack,
    } as HttpRequest<null, {}, typeof mockPaginationParams, IUserTranslation>;

    const response = await controller.handle(req);

    expect(useCase.execute).toHaveBeenCalledWith(mockPaginationParams);
    expect(response).toEqual({
      statusCode: 200,
      message: "user.listUsers.success",
      data: {
        ...mockPaginatedUsers,
        content: mockPaginatedUsers.content.map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          createdAt: u.createdAt,
        })),
      },
    });
  });

  it("should handle empty results", async () => {
    useCase.execute.mockResolvedValue({
      ...mockPaginatedUsers,
      content: [],
      totalItems: 0,
      nextPage: null,
      previousPage: null,
      page: 1,
      size: 10,
    });

    const req = {
      query: { page: 1, size: 10 },
      languagePack,
    } as HttpRequest<null, {}, typeof mockPaginationParams, IUserTranslation>;

    const response = await controller.handle(req);

    expect(response.data?.content).toHaveLength(0);
    expect(response.statusCode).toBe(200);
  });

  it("should use default pagination values when not provided", async () => {
    useCase.execute.mockResolvedValue(mockPaginatedUsers);

    const req = {
      query: {},
      languagePack,
    } as HttpRequest<null, {}, any, IUserTranslation>;

    await controller.handle(req);

    expect(useCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        size: 10,
      }),
    );
  });
});
