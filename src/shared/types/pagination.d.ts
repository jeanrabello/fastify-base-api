export interface PaginationParams {
  page?: number; // 1-indexed
  size?: number; // items per page
}

export interface PaginatedResult<T> {
  totalItems: number;
  nextPage: number | null;
  previousPage: number | null;
  page: number;
  size: number;
  content: T[];
}
