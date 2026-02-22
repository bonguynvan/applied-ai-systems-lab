export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export interface CacheStore {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  getStats(): { size: number; entries: { key: string; timestamp: number; ttl?: number }[] };
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  enabled?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}
