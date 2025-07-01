type VirtualFilesystemTree =
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

declare module "*?raw" {
  const src: string;
  export default src;
}

declare module "*?dtstext" {
  const src: string;
  export default src;
}

declare module "*?vfs" {
  const tree: VirtualFilesystemTree;
  export default tree;
}
