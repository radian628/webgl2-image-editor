export type FilesystemAdaptor = {
  readDir: (path: string) => Promise<string[] | undefined>;
  isDir: (path: string) => Promise<boolean | undefined>;
  readFile: (path: string) => Promise<Blob | undefined>;
  writeFile: (path: string, contents: Blob) => Promise<Blob | undefined>;
  getDefaultPath: () => Promise<string>;
  watchFile: (path: string, callback: () => void) => () => void;
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

function traverse(tree: VirtualFilesystemTree, path: string) {
  const splitPath = path.split("/").slice(1);

  const r = (path: string[], tree: VirtualFilesystemTree) => {
    if (path.length === 0) return tree;
    if (tree.type === "dir") {
      const item = tree.contents.get(path[0]);
      if (!item) return undefined;
      return r(path.slice(1), item);
    }
    return undefined;
  };

  return r(splitPath, tree);
}

export function createVirtualFilesystem(
  tree: VirtualFilesystemTree
): FilesystemAdaptor {
  const watchers = new Map<string, Set<() => void>>();
  return {
    watchFile(path: string, callback: () => void) {
      let callbacks = watchers.get(path);
      if (!callbacks) {
        callbacks = new Set();
        watchers.set(path, callbacks);
      }
      callbacks.add(callback);
      return () => callbacks.delete(callback);
    },
    readDir(path: string) {
      const dir = traverse(tree, path);
      if (!dir || dir.type === "file") return Promise.resolve(undefined);
      return Promise.resolve([...dir.contents.keys()]);
    },
    isDir(path: string) {
      const dir = traverse(tree, path);
      if (!dir) return Promise.resolve(undefined);
      return Promise.resolve(dir.type === "dir");
    },
    readFile(path: string) {
      const file = traverse(tree, path);
      if (!file || file.type === "dir") return Promise.resolve(undefined);
      return Promise.resolve(file.contents);
    },
    writeFile(path: string, contents: Blob) {
      let item = tree;
      const splitPath = path.split("/").slice(1);

      // traverse path to find item
      while (splitPath.length > 0) {
        const pathSegment = splitPath.shift()!;
        if (item.type === "file") {
          return Promise.resolve(undefined);
        }
        const itemTemp = item.contents.get(pathSegment);
        if (itemTemp) {
          item = itemTemp;
        } else {
          const olditem = item;
          item = {
            type: "dir",
            name: pathSegment,
            contents: new Map(),
          };
          olditem.contents.set(pathSegment, item);
        }
      }

      if (item.type === "file") {
        item.contents = contents;
        for (const w of watchers.get(path) ?? []) {
          w();
        }
        return Promise.resolve(contents);
      }
      return Promise.resolve(undefined);
    },
    getDefaultPath() {
      return Promise.resolve(tree.name);
    },
  };
}
