/**
 * A small LRU (least recently used) cache.
 *
 * `Map` keeps keys in insertion order, so the first key is always the least
 * recently used one if every read re-inserts the key at the end.
 *
 * The cache is bounded twice:
 *   - by the number of entries;
 *   - by the total "size" of entries (e.g. the length of query strings).
 * A cache bounded only by the number of entries can still be filled with
 * huge values by a client sending many different large queries.
 */
export class LRUCache<K, V> {
  private readonly entries = new Map<K, { value: V; size: number }>();
  private totalSize = 0;

  constructor(
    private readonly maxEntries: number,
    private readonly maxTotalSize: number,
  ) {}

  get(key: K): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) {
      return undefined;
    }

    // move to the end: most recently used
    this.entries.delete(key);
    this.entries.set(key, entry);

    return entry.value;
  }

  set(key: K, value: V, size: number) {
    if (size > this.maxTotalSize || this.maxEntries <= 0) {
      return;
    }

    const existing = this.entries.get(key);
    if (existing) {
      this.totalSize -= existing.size;
      this.entries.delete(key);
    }

    this.entries.set(key, { value, size });
    this.totalSize += size;

    // evict the least recently used entries
    while (this.entries.size > this.maxEntries || this.totalSize > this.maxTotalSize) {
      const oldestKey = this.entries.keys().next().value as K;
      const oldest = this.entries.get(oldestKey)!;
      this.entries.delete(oldestKey);
      this.totalSize -= oldest.size;
    }
  }

  get size() {
    return this.entries.size;
  }
}
