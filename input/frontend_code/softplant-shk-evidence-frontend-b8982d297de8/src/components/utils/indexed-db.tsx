import { IDBPDatabase, openDB } from 'idb';

export class IndexedDb {
  private _db: IDBPDatabase | null = null;

  constructor(private readonly _database: string) {}

  async createObjectStore(tableNames: string[]) {
    try {
      this._db = await openDB(this._database, 1, {
        upgrade(db: IDBPDatabase) {
          for (const tableName of tableNames) {
            if (db.objectStoreNames.contains(tableName)) {
              continue;
            }
            db.createObjectStore(tableName);
          }
        },
      });
    } catch (_error) {
      return false;
    }
  }

  async getValue(tableName: string, id: number | string) {
    if (!this._db) return;

    const tx = this._db.transaction(tableName, 'readonly');
    const store = tx.objectStore(tableName);
    const result = await store.get(id);
    return result;
  }

  async getAllValue(tableName: string) {
    if (!this._db) return;

    const tx = this._db.transaction(tableName, 'readonly');
    const store = tx.objectStore(tableName);
    const result = await store.getAll();
    return result;
  }

  async putValue(tableName: string, value: object, key: string | number) {
    if (!this._db) return;

    const tx = this._db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    const result = await store.put(value, key);
    return result;
  }

  async deleteValue(tableName: string, id: number | string) {
    if (!this._db) return;

    const tx = this._db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    const result = await store.get(id);
    if (!result) {
      return result;
    }
    await store.delete(id);
    return id;
  }

  async deleteAllValue(tableName: string) {
    if (!this._db) return;

    const tx = this._db.transaction(tableName, 'readwrite');
    const store = tx.objectStore(tableName);
    if (store) {
      await store.clear();
    }
    return;
  }
}
