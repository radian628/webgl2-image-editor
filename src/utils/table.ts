export interface IMultiMap<K, V> {
  set: (k: K, v: V) => void;
  get: (k: K) => V[];
  // can only delete by value since this is a multimap
  delete: (k: K, cb: (v: V) => boolean) => V[];
  entries: Map<K, V[]>["entries"];
}

export class MultiMap<K, V> implements IMultiMap<K, V> {
  map: Map<K, V[]>;
  constructor() {
    this.map = new Map();
  }

  get(k: K) {
    return this.map.get(k) ?? [];
  }

  set(k: K, v: V) {
    const bucket = this.map.get(k)?.concat([v]) ?? [v];
    this.map.set(k, bucket);
  }

  delete(k: K, cb: (v: V) => boolean) {
    const bucket = this.map.get(k) ?? [];
    this.map.set(k, bucket.filter(cb));
    return bucket.filter((v) => !cb(v));
  }

  entries() {
    return this.map.entries();
  }
}

export type Table<T> = {
  filter: {
    [Key in keyof T]: (k: T[Key]) => Table<T>;
  };
  delete: () => T[];
  get: () => T[];
  insert: (t: T) => void;
};

export function table<T>(data?: T[]): Table<T> {
  if (!data) data = [];

  const maps = new Map<any, MultiMap<any, any[]>>();

  function backfillMap(prop: any) {
    let map = maps.get(prop);
    if (!map) {
      map = new MultiMap();
      maps.set(prop, map);
      for (const [k, v] of maps.values().next().value?.entries() ?? []) {
        map.set(v[prop], v);
      }
    }
  }

  return {
    // @ts-expect-error
    delete: new Proxy(
      {},
      {
        get(target, prop, receiver) {
          backfillMap(prop);

          // @ts-expect-error
          return (key) => maps.get(prop)?.delete(key, () => false);
        },
      }
    ),

    insert(t: T) {
      for (const [k, v] of maps.entries()) {
        // @ts-expect-error
        v.set(t[k], t);
      }
    },
  };
}
