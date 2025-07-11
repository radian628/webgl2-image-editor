export type FilesystemAdaptor = {
  readDir: (path: string) => Promise<string[] | undefined>;
  isDir: (path: string) => Promise<boolean | undefined>;
  readFile: (path: string) => Promise<Blob | undefined>;
  writeFile: (path: string, contents: Blob) => Promise<Blob | undefined>;
  getDefaultPath: () => Promise<string>;
  watchFile: (path: string, callback: () => void) => () => void;
  watchPattern: (
    root: string,
    match: (path: string) => boolean,
    callback: (path: string) => void
  ) => () => void;
};

export type SyncFilesystemAdaptor = {
  [Key in keyof FilesystemAdaptor]: (
    ...args: Parameters<FilesystemAdaptor[Key]>
  ) => Awaited<ReturnType<FilesystemAdaptor[Key]>>;
};

export type VirtualFilesystemTree =
  | {
      type: "dir";
      name: string;
      contents: Map<string, VirtualFilesystemTree>;
    }
  | {
      type: "file";
      name: string;
      contents: Blob;
    };
