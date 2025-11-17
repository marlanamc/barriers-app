import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export function useCache<T>(
  ttl: number = 5 * 60 * 1000 // 5 minutes default
) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T, customTtl?: number) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl ?? ttl,
    });
  }, [ttl]);

  const clear = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.current.delete(key);
      return false;
    }

    return true;
  }, []);

  return { get, set, clear, has };
}

// Hook for caching async operations
export function useAsyncCache<T>(
  asyncFn: () => Promise<T>,
  key: string,
  ttl?: number
) {
  const cache = useCache<T>(ttl);

  const execute = useCallback(async (): Promise<T> => {
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = await asyncFn();
    cache.set(key, result);
    return result;
  }, [asyncFn, key, cache]);

  const invalidate = useCallback(() => {
    cache.clear(key);
  }, [key, cache]);

  return { execute, invalidate };
}
