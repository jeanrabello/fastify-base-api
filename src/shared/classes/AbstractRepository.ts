import { getDb } from "@src/loaders/database";
import { Repository } from "@src/types/repository";
import { Db } from "mongodb";

export abstract class AbstractRepository<T = unknown, K = unknown>
  implements Repository
{
  protected db: Db = getDb();

  abstract execute(user: T): Promise<K>;
}
