import { IndexedDb } from '@/components/utils';

const INDEXED_DB_KEY = 'indexDB';
const INDEXED_DB_STORE_KEY = 'indexDBStore';

export const setCachedDataByKey = async (uniqueKey: string, data: Array<{ [key: string]: string }>) => {
  const indexedDb = new IndexedDb(INDEXED_DB_KEY);
  await indexedDb.createObjectStore([INDEXED_DB_STORE_KEY]);
  await indexedDb.putValue(
    INDEXED_DB_STORE_KEY,
    data.map((item) => {
      return { ...item };
    }),
    uniqueKey,
  );
};

export const getCachedDataByKey = async (uniqueKey: string) => {
  const indexedDb = new IndexedDb(INDEXED_DB_KEY);
  await indexedDb.createObjectStore([INDEXED_DB_STORE_KEY]);
  const cachedData: { [key: string]: string }[] = await indexedDb.getValue(INDEXED_DB_STORE_KEY, uniqueKey);
  return cachedData;
};

export const clearDataDB = async () => {
  const indexedDb = new IndexedDb(INDEXED_DB_KEY);
  await indexedDb.createObjectStore([INDEXED_DB_STORE_KEY]);
  await indexedDb.deleteAllValue(INDEXED_DB_STORE_KEY);
};
