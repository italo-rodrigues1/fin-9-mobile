/** Share concurrent reads and reuse recent successes during screen navigation. */
export function createQueryCache<T>(ttl = 10_000, now = Date.now) {
  const cached = new Map<string, { value: T; expires: number }>();
  const pending = new Map<string, Promise<T>>();
  let generation = 0;
  return {
    clear() {
      generation++;
      cached.clear();
      pending.clear();
    },
    load(key: string, request: () => Promise<T>, force = false): Promise<T> {
      for (const [entryKey, entry] of cached)
        if (entry.expires <= now()) cached.delete(entryKey);
      const active = pending.get(key);
      if (active) return active;
      const entry = cached.get(key);
      if (!force && entry) return Promise.resolve(entry.value);
      const version = generation;
      // Start on the next microtask so synchronous failures also clean up correctly.
      const promise = Promise.resolve()
        .then(request)
        .then((value) => {
          if (version === generation)
            cached.set(key, { value, expires: now() + ttl });
          return value;
        })
        .catch((error) => {
          if (version === generation) cached.delete(key);
          throw error;
        })
        .finally(() => {
          if (pending.get(key) === promise) pending.delete(key);
        });
      pending.set(key, promise);
      return promise;
    },
  };
}
