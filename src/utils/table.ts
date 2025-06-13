// this is horrible why am i doing this
export class ArrayMap<K, V, Arr extends [K, ...K[]] = [K, ...K[]]> {
  maps: Map<number, Map<any, any>>;
  constructor() {
    this.maps = new Map();
  }

  nthMap(n: number) {
    let map = this.maps.get(n);
    if (!map) {
      map = new Map();
      this.maps.set(n, map);
    }
    return map;
  }

  get(path: Arr): V | undefined {
    let map = this.nthMap(path.length);
    for (const p of path) {
      map = map.get(p);
      if (!map) return undefined;
    }
    // @ts-expect-error
    return map;
  }

  delete(path: Arr): V | undefined {
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      map = map.get(p);
      if (!map) return undefined;
    }
    const item = map.get(path.at(-1));
    map.delete(path.at(-1));
    return item;
  }

  change(path: Arr, cb: (v: V | undefined) => V) {
    let map = this.nthMap(path.length);
    for (const p of path.slice(0, -1)) {
      let oldMap = map;
      map = map.get(p);
      if (!map) {
        map = new Map();
        oldMap.set(p, map);
      }
    }
    map.set(path.at(-1), cb(map.get(path.at(-1))));
  }

  set(path: Arr, value: V) {
    this.change(path, () => value);
  }

  forEach(map: (path: Arr, v: V) => void) {
    const r = (n: number, m: Map<any, any>, path: K[]) => {
      if (n === 0) {
        // @ts-expect-error
        map(path, m);
      } else {
        for (const [k, v] of m) r(n - 1, m, path.concat(k));
      }
    };

    for (const [n, map] of this.maps) {
      r(n, map, []);
    }
  }
}

export type Table<T> = {
  filter: {
    [Key in keyof T]: <K extends T[Key]>(
      k: K
    ) => Table<T & { [Key2 in Key]: K }>;
  };
  delete: () => T[];
  get: () => T[];
  getOne: () => T;
  add: (t: T) => void;
  [Symbol.iterator]: Array<T>[typeof Symbol.iterator];
};

type ObjKey = string | number | symbol;

export function table<T>(
  data?: Set<T>,
  indexPaths?: ArrayMap<keyof T, true>,
  indexes?: ArrayMap<any, Set<T>>,
  propFilterKeys?: [keyof T, ...(keyof T)[]],
  propFilterValues?: [any, ...any[]]
): Table<T> {
  if (!data) data = new Set();
  if (!indexes) indexes = new ArrayMap();
  if (!indexPaths) indexPaths = new ArrayMap();
  if (!propFilterKeys) propFilterKeys = [] as any;
  if (!propFilterValues) propFilterValues = [] as any;

  return {
    // @ts-expect-error
    filter: new Proxy(
      {},
      {
        get(target, prop, receiver) {
          return (v: any) =>
            table(
              data,
              indexPaths,
              indexes,
              propFilterKeys!.concat(prop as keyof T) as any,
              propFilterValues!.concat(v) as any
            );
        },
      }
    ),

    get() {
      if (propFilterKeys!.length === 0) {
        return [...data];
      }

      propFilterKeys = [...new Set(propFilterKeys)].sort() as any;
      // @ts-expect-error
      const indexPathExists = indexPaths.get(propFilterKeys);
      if (!indexPathExists) {
        for (const d of data) {
          const filter = propFilterKeys!.flatMap((e) => [e, d[e]]);
          const set = indexes.change(filter as any, (s) =>
            (s ?? new Set()).add(d)
          );
        }
        indexPaths.set(propFilterKeys!, true);
      }

      const fullFilter = propFilterKeys!.flatMap((e, i) => [
        e,
        propFilterValues![i],
      ]);

      // @ts-expect-error
      const set = indexes.get(fullFilter);
      return set ? [...set] : [];
    },

    getOne() {
      const data = this.get();
      if (data.length !== 1)
        throw new Error(
          `Expected a single result. path=${propFilterKeys!.join(
            ","
          )}, values=${propFilterValues!.join(",")}`
        );
      return data[0];
    },

    delete() {
      propFilterKeys = [...new Set(propFilterKeys)].sort() as any;
      const toDelete = this.get();
      indexPaths.forEach((path, set) => {
        for (const d of toDelete) {
          const filter = path.flatMap((e) => [e, d[e]]);
          indexes.change(filter as any, (s) => (s?.delete(d), s ?? new Set()));
        }
      });
      for (const d of toDelete) {
        data.delete(d);
      }
      return toDelete;
    },

    add(t) {
      propFilterKeys = [...new Set(propFilterKeys)].sort() as any;
      indexPaths.forEach((path, set) => {
        const filter = path.flatMap((e) => [e, t[e]]);
        indexes.change(filter as any, (s) => (s ?? new Set()).add(t));
      });
      data.add(t);
    },

    [Symbol.iterator]() {
      return this.get()[Symbol.iterator]();
    },
  };
}

type Test = Array<number>[typeof Symbol.iterator];

export function tableWithData<T>(data: T[]) {
  const tbl = table<T>();

  for (const d of data) {
    tbl.add(d);
  }

  return tbl;
}
