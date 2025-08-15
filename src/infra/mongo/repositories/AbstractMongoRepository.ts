import { Db } from "mongodb";
import { getMongoDb } from "@src/loaders/mongoDatabase";

export abstract class AbstractMongoRepository {
  private _db?: Db;

  protected get db(): Db {
    if (!this._db) {
      this._db = getMongoDb();
    }
    return this._db;
  }
}
