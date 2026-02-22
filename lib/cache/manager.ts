import { hashInput } from '@/lib/utils/hash';
import { getCacheStore } from '@/lib/cache/store';
import { CacheOptions } from '@/types/cache';

const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedResult<T = any>(
  namespace: string,
  input: any
): Promise<T | null> {
  const key = await generateCacheKey(namespace, input);
  const cache = getCacheStore();
  return cache.get<T>(key);
}

export async function setCachedResult<T = any>(
  namespace: string,
  input: any,
  result: T,
  options: CacheOptions = {}
): Promise<void> {
  const key = await generateCacheKey(namespace, input);
  const cache = getCacheStore();
  const ttl = options.ttl ?? DEFAULT_CACHE_TTL;
  await cache.set(key, result, ttl);
}

export async function clearCache(): Promise<void> {
  const cache = getCacheStore();
  await cache.clear();
}

export async function generateCacheKey(
  namespace: string,
  input: any
): Promise<string> {
  const inputHash = await hashInput(input);
  return `${namespace}:${inputHash}`;
}

export function getCacheStats() {
  const cache = getCacheStore();
  return cache.getStats();
}
