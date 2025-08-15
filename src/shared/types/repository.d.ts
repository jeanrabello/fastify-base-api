export interface Repository<T = unknown, K = unknown> {
  execute(user: T): Promise<K>;
}
