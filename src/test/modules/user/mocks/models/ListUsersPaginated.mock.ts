import { PaginatedResult } from "@src/shared/types/pagination";
import { User } from "@src/shared/entities/user.entity";

export const mockPaginationParams = {
  page: 1,
  size: 10,
};

export const mockPaginatedUsers: PaginatedResult<Partial<User>> = {
  content: [
    {
      id: "1",
      username: "User 1",
      email: "user1@example.com",
      createdAt: new Date(),
    },
    {
      id: "2",
      username: "User 2",
      email: "user2@example.com",
      createdAt: new Date(),
    },
  ],
  totalItems: 2,
  size: 10,
  page: 1,
  nextPage: null,
  previousPage: null,
};

export const emptyPaginatedUsers: PaginatedResult<Partial<User>> = {
  content: [],
  totalItems: 0,
  size: 10,
  page: 1,
  nextPage: null,
  previousPage: null,
};
