export async function cacheData<T>(key: string, data: T): Promise<T> {
  const existing = await Storage.get<T>(key, 'json');
  if (existing) return existing;
  await Storage.put(key, JSON.stringify(data), { expirationTtl: 300 });
  return data;
}