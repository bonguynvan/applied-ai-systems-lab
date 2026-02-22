import { CacheStore, CacheEntry } from '@/types/cache';
import { getRedis } from '@/lib/redis';
import { RedisCacheStore } from '@/lib/cache/redis-store';

export class InMemoryCacheStore implements CacheStore {
  private cache: Map<string, CacheEntry> = new Map();

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
      })),
    };
  }
}

let memoryInstance: InMemoryCacheStore | null = null;
let redisInstance: RedisCacheStore | null = null;

export function getCacheStore(): CacheStore {
  if (getRedis()) {
    if (!redisInstance) redisInstance = new RedisCacheStore();
    return redisInstance;
  }
  if (!memoryInstance) memoryInstance = new InMemoryCacheStore();
  return memoryInstance;
}
