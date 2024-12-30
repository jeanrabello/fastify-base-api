import { Db } from "mongodb";
import { Repository } from "@src/types/repository";
import { getDb } from "@src/loaders/database";

export abstract class AbstractRepository<T = unknown, K = unknown>
  implements Repository
{
  private _db?: Db;

  protected get db(): Db {
    if (!this._db) {
      this._db = getDb();
    }
    return this._db;
  }

  abstract execute(user: T): Promise<K>;
}
