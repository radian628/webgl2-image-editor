import { v4 } from "uuid";

type InterfaceWithMethods = Record<string, (...args: any[]) => any>;

export type WorkerifyInterface<T extends InterfaceWithMethods> = {
  [K in keyof T]: (
    ...args: Parameters<T[K]>
  ) => ReturnType<T[K]> extends Promise<any>
    ? ReturnType<T[K]>
    : Promise<ReturnType<T[K]>>;
};

type WorkerifyRequest<T extends InterfaceWithMethods> = {
  [K in keyof T]: {
    type: K;
    contents: Parameters<T[K]>;
    _discriminator: string;
    id: string;
  };
}[keyof T];

type WorkerifyResponse<T extends InterfaceWithMethods> = {
  [K in keyof T]: {
    contents: ReturnType<T[K]>;
    _discriminator: string;
    id: string;
  };
}[keyof T];

export function workerifyServer<I extends InterfaceWithMethods>(
  i: I,
  discriminator: string,
  onReceive: (cb: (req: any) => any) => () => void,
  send: (res: any) => void
) {
  let inf = i;
  const unsub = onReceive(async (req: any) => {
    if (!req || req._discriminator !== discriminator) {
      return;
    }

    const typedReq: WorkerifyRequest<I> = req;

    const responseContents = await inf[typedReq.type](...typedReq.contents);

    send({
      contents: responseContents,
      _discriminator: discriminator,
      id: typedReq.id,
    });
  });

  return {
    unsub,
    setInterface(i: I) {
      inf = i;
    },
  };
}

export function workerifyClient<I extends InterfaceWithMethods>(
  discriminator: string,
  onReceive: (cb: (req: any) => any) => () => void,
  send: (req: any) => void
): WorkerifyInterface<I> {
  return new Proxy({} as I, {
    get(i, prop) {
      return (...args: any[]) => {
        const id = v4();
        const req = {
          type: prop,
          contents: args,
          _discriminator: discriminator,
          id,
        };

        return new Promise((resolve, reject) => {
          onReceive((res) => {
            if (!res || res._discriminator !== discriminator) {
              return;
            }

            const typedRes: WorkerifyResponse<I> = res;

            if (typedRes.id === id) {
              resolve(typedRes.contents);
            }
          });
          send(req);
        });
      };
    },
  });
}
