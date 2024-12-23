export interface Controller<T = unknown> {
  handle(request: HttpRequest<T>): Promise<HttpRequest>;
}
