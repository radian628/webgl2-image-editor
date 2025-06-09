type NestedKeyOf<T, K> = K extends [infer K1, ...infer Kr]
  ? K1 extends keyof T
    ? NestedKeyOf<T[K1], Kr>
    : never
  : K extends []
  ? T
  : never;

export function setDeep<T, K extends [...string[]]>(
  t: T,
  path: K,
  v: (oldValue: NestedKeyOf<T, K>) => NestedKeyOf<T, K>
): T {
  // @ts-expect-error
  if (t === undefined) return undefined;

  if (path.length > 0) {
    return {
      ...t,
      // @ts-expect-error
      [path[0]]: setDeep(t[path[0]], path.slice(1), v),
    };
  } else {
    // @ts-expect-error
    return v(t);
  }
}

type StringKeys<T> = {
  [Key in keyof T]: T[Key] extends string ? T[Key] : never;
};

type LensValue<T, Root> = (cb: (t: T) => T) => Root;
type LensPartial<T, Root> = (cb: (t: T) => Partial<T>) => Root;
type LensEach<T, Root, I> = (
  cb: (item: I, index: number, array: I[]) => I
) => Root;
type LensMatch<T, Root> = <K extends keyof StringKeys<T>>(
  prop: K,
  matchers:
    | ({
        [Key in (T[K] & string) | "$d"]?: Key extends "$d"
          ? (t: T) => T
          : (t: T & { [Key2 in K]: Key }) => T;
      } & { $d: (t: T) => T })
    | {
        [Key in T[K] & string]: (t: T & { [Key2 in K]: Key }) => T;
      }
) => Root;

type WithLensMethods<T, Root> = T & {
  $: LensValue<T, Root>;
  $p: LensPartial<T, Root>;
  $f: LensObject<T, T>;
  $m: LensMatch<T, Root>;
} & (T extends (infer I)[]
    ? {
        $e: LensEach<T, Root, I>;
      }
    : {});

type LensObject<T, Root> = {
  [K in keyof WithLensMethods<T, Root>]-?: K extends "$"
    ? LensValue<T, Root>
    : K extends "$p"
    ? LensPartial<T, Root>
    : K extends "$f"
    ? LensObject<T, T>
    : K extends "$e"
    ? T extends (infer I)[]
      ? LensEach<T, Root, I>
      : never
    : K extends "$m"
    ? LensMatch<T, Root>
    : undefined extends WithLensMethods<T, Root>[K]
    ? LensObject<WithLensMethods<T, Root>[K], Root>
    : LensObject<WithLensMethods<T, Root>[K], Root>;
};

export function lens<T, R = T>(
  t: T,
  path?: string[],
  root?: any
): LensObject<T, R> {
  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        if (prop === "$") {
          // @ts-expect-error
          return (cb) => setDeep(root, path, cb);
        } else if (prop === "$p") {
          // @ts-expect-error
          return (cb) => setDeep(root, path, (o) => ({ ...o, ...cb(o) }));
        } else if (prop === "$f") {
          return lens(t);
        } else if (prop === "$e") {
          // @ts-expect-error
          return (cb) => setDeep(root, path, (t) => t.map(cb));
        } else if (prop === "$m") {
          // @ts-expect-error
          return (prop, matchers) =>
            // @ts-expect-error
            setDeep(root, path, (t) => (matchers[t[prop]] ?? matchers.$d)(t));
        } else {
          // @ts-expect-error
          return lens(t?.[prop], [...(path ?? []), prop], root ?? t);
        }
      },
    }
  ) as unknown as LensObject<T, R>;
}

export function id<T>(t: T) {
  return t;
}
