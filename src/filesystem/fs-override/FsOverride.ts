import { FilesystemAdaptor } from "../fs-protocol/FilesystemAdaptor";

// TODO: FINISH THIS
export function createOverridableVirtualFilesystem(
  fs: FilesystemAdaptor
): FilesystemAdaptor & {
  overrideFile: (path: string, file: Blob | undefined) => void;
} {
  const overrides = new Map<string, Blob>();

  const watchers = new Map<string, Set<() => void>>();
  const watchPatterns: Set<{
    root: string[];
    match: (path: string) => boolean;
    callback: (path: string) => void;
  }> = new Set();

  return {
    watchFile(path, cb) {
      let callbacks = watchers.get(path);
      if (!callbacks) {
        callbacks = new Set();
        watchers.set(path, callbacks);
      }
      callbacks.add(cb);
      const unsub = fs.watchFile(path, cb);
      return () => {
        unsub();
        callbacks.delete(cb);
      };
    },
    watchPattern(root, match, callback) {
      const pat = { root: root.split("/").slice(1), match, callback };
      watchPatterns.add(pat);
      const unsub = fs.watchPattern(root, match, callback);
      return () => {
        unsub();
        watchPatterns.delete(pat);
      };
    },
    isDir(path) {
      if (overrides.has(path)) return Promise.resolve(false);
      return fs.isDir(path);
    },
    readDir(path) {
      return fs.readDir(path);
    },
    writeFile(path, contents) {
      return fs.writeFile(path, contents);
    },
    getDefaultPath() {
      return fs.getDefaultPath();
    },
    readFile(path) {
      if (overrides.get(path)) return Promise.resolve(overrides.get(path)!);
      return fs.readFile(path);
    },
    overrideFile(path, file) {
      // register changes to overridden file via watchers
      const splitPath = path.split("/").slice(1);
      for (const w of watchers.get(path) ?? []) {
        w();
      }
      for (const w of watchPatterns) {
        let matches = true;
        for (let i = 0; i < w.root.length; i++) {
          if (w.root[i] !== splitPath.at(i)) {
            matches = false;
          }
        }
        if (!matches) continue;
        if (!w.match(path)) continue;
        w.callback(path);
      }

      if (file) {
        overrides.set(path, file);
      } else {
        overrides.delete(path);
      }
    },
  };
}
