export type ResultSuccess<T> = {
  readonly success: true;
  readonly data: T;
};
export type ResultError<E> = {
  readonly success: false;
  readonly error: E;
};

export class Result<T, E> {
  readonly data: ResultSuccess<T> | ResultError<E>;
  constructor(data: ResultSuccess<T> | ResultError<E>) {
    this.data = data;
  }

  unsafeExpectSuccess() {
    if (this.data.success) return this.data.data;

    throw new Error("Expected a non-error response from a Result!");
  }

  mapS<T2>(f: (t: T) => T2): Result<T2, E> {
    if (this.data.success)
      return new Result<T2, E>({
        success: true,
        data: f(this.data.data),
      });

    // @ts-expect-error T and T2 only matter if this is a ResultSuccess
    return this as Result<T2, E>;
  }

  mapE<E2>(f: (e: E) => E2): Result<T, E2> {
    if (!this.data.success)
      return new Result<T, E2>({
        success: false,
        error: f(this.data.error),
      });

    // @ts-expect-error T and T2 only matter if this is a ResultSuccess
    return this as Result<T2, E>;
  }
}

export function ok<T, E>(data: T) {
  return new Result<T, E>({ success: true, data });
}

export function err<T, E>(error: E) {
  return new Result<T, E>({ success: false, error });
}

export function splitSuccessesAndErrors<T, E>(
  results: Result<T, E>[]
): [T[], E[]] {
  const successes: T[] = [];
  const errors: E[] = [];

  for (const r of results) {
    if (r.data.success) {
      successes.push(r.data.data);
    } else {
      errors.push(r.data.error);
    }
  }

  return [successes, errors];
}
