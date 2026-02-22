import type { CacheStore } from '@/types/cache';
import { getRedis } from '@/lib/redis';

const KEY_PREFIX = 'ai-lab:cache:';
const DEFAULT_TTL_SEC = 24 * 60 * 60; // 24 hours

export class RedisCacheStore implements CacheStore {
  private redis = getRedis()!;

  async get<T = unknown>(key: string): Promise<T | null> {
    const fullKey = KEY_PREFIX + key;
    const raw = await this.redis.get(fullKey);
    if (raw == null) return null;
    try {
      return JSON.parse(raw as string) as T;
    } catch {
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = KEY_PREFIX + key;
    const serialized = JSON.stringify(value);
    const sec = ttl != null ? Math.ceil(ttl / 1000) : DEFAULT_TTL_SEC;
    await this.redis.set(fullKey, serialized, { ex: sec });
  }

  async clear(): Promise<void> {
    const keys = await this.redis.keys(KEY_PREFIX + '*');
    if (keys.length > 0) await this.redis.del(...keys);
  }

  async has(key: string): Promise<boolean> {
    const v = await this.get(key);
    return v !== null;
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(KEY_PREFIX + key);
  }

  getStats() {
    return {
      size: 0,
      entries: [] as { key: string; timestamp: number; ttl?: number }[],
    };
  }
}
