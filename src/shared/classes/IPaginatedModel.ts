export interface IPaginatedModel<Content = unknown> {
  totalItems: number;
  nextPage: number | null;
  previousPage: number | null;
  page: number;
  size: number;
  content: Array<Content>;
}
