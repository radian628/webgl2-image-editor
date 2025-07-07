import * as esbuild from "esbuild";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { copy } from "esbuild-plugin-copy";
import * as ts from "typescript";
import { buildParserFile } from "@lezer/generator";
import * as tsvfs from "@typescript/vfs";

// plugin for the ?raw query param
// to make "raw" resources use the text loader
const rawQueryParamPlugin: esbuild.Plugin = {
  name: "raw",
  setup(build) {
    build.onResolve({ filter: /\?.*raw/ }, (args) => {
      console.log("raw start");
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "raw-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "raw-ns" }, async (args) => {
      console.log("raw end");
      const fspath = args.path.replace(/\?.*$/, "");
      return {
        contents: (await fs.readFile(fspath)).toString(),
        loader: "text",
        watchFiles: [fspath],
      };
    });
  },
};

type SimpleVFS =
  | {
      type: "dir";
      dir: Map<string, SimpleVFS>;
    }
  | {
      type: "file";
      file: string;
    };

function buildVFSTreeFromStrings(files: Map<string, string>) {
  const splitPaths: string[][] = [];

  const root: SimpleVFS = {
    type: "dir",
    dir: new Map(),
  };

  let currentDirs = root.dir;

  for (const [path, file] of files) {
    const splitPath = path.split("/");
    addPath(splitPath, file, root);
  }

  function addPath(
    path: string[],
    file: string,
    vfs: SimpleVFS & { type: "dir" }
  ) {
    if (path.length === 1) {
      vfs.dir.set(path[0], { type: "file", file });
    } else {
      let dir = vfs.dir.get(path[0]);
      if (!dir) {
        dir = { type: "dir", dir: new Map() };
        vfs.dir.set(path[0], dir);
      }
      if (dir.type !== "dir") return;
      addPath(path.slice(1), file, dir);
    }
  }

  return root;
}

function serializeVFS(vfs: SimpleVFS): string {
  if (vfs.type === "dir") {
    return `{
  type: "dir",
  contents: new Map([${[...vfs.dir.entries()].map(([k, v]) => `[${JSON.stringify(k)}, ${serializeVFS(v)}]`)}])
}`;
  } else {
    return `{
  type: "file",
  contents: new Blob([${JSON.stringify(vfs.file)}])    
}`;
  }
}

const rawDtsQueryParamPlugin: esbuild.Plugin = {
  name: "dtstext",
  setup(build) {
    build.onResolve({ filter: /\?.*dtstext/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "dtstext-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "dtstext-ns" }, async (args) => {
      const start = Date.now();
      const options: ts.CompilerOptions = {
        declaration: true,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
      };

      const createdFiles = new Map<string, string>();

      const host = ts.createCompilerHost(options);

      return new Promise((resolve, reject) => {
        const filename = args.path.replace(/\?.*$/, "");

        const filesToWatch: string[] = [];

        // const oldReadFile = host.readFile.bind(host);
        // host.readFile = (...args) => {
        //   filesToWatch.push(args[0]);
        //   return oldReadFile(...args);
        // };
        // host.writeFile = (fileName, text) => {
        //   console.log("filename", fileName);
        //   createdFiles.set(path.relative(__dirname, fileName), text);
        // };

        console.log("FILENAME", filename);

        const program = ts.createProgram(
          [filename],
          {
            ...options,
          },
          host
        );

        const result = program.emit();
        console.log(result);

        const vfs = buildVFSTreeFromStrings(createdFiles);

        resolve({
          contents: `export default ${serializeVFS(vfs)};`,
          loader: "ts",
          watchFiles: filesToWatch,
        });
      });
    });
  },
};

async function buildVFSTree(
  link: string,
  levels: number,
  filterSuffix: string
): Promise<string | undefined> {
  const isDir = (await fs.lstat(link)).isDirectory();
  if (isDir && levels > 0) {
    const contents = (
      await Promise.all(
        (await fs.readdir(link)).map(async (l) => ({
          name: l,
          tree: await buildVFSTree(`${link}/${l}`, levels - 1, filterSuffix),
        }))
      )
    ).filter((e) => e.tree !== undefined);

    return `{
  type: "dir",
  name: ${JSON.stringify(link.split("/").at(-1))},
  contents: new Map([${contents.map((c) => `[${JSON.stringify(c.name)}, ${c.tree}]`).join(",")}])
}`;
  } else if (!isDir && link.endsWith(filterSuffix)) {
    return `{
  type: "file",
  name: ${JSON.stringify(link.split("/").at(-1))},
  contents: new Blob([${JSON.stringify((await fs.readFile(link)).toString())}])   
}`;
  }
}

async function getAllFilesAndDirs(
  link: string
): Promise<{ dirs: string[]; files: string[] }> {
  const isDir = (await fs.lstat(link)).isDirectory();
  if (isDir) {
    const fileNames = await fs.readdir(link);
    const children = await Promise.all(
      fileNames.map(async (fn) => await getAllFilesAndDirs(`${link}/${fn}`))
    );
    return {
      dirs: [link, ...children.flatMap((c) => c.dirs)],
      files: children.flatMap((c) => c.files),
    };
  }
  return {
    dirs: [],
    files: [link],
  };
}

const vfsBuilderPlugin: esbuild.Plugin = {
  name: "vfs",
  setup(build) {
    build.onResolve({ filter: /\?.*vfs.*$/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "vfs-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "vfs-ns" }, async (args) => {
      console.log("building vfs", args.path);
      const search = new URLSearchParams(args.path.match(/\?.*$/g)![0]);
      let depth = parseInt(search.get("depth")!);
      if (!depth) depth = Infinity;
      let filterSuffix = search.get("filterSuffix") ?? "";
      const fspath = args.path.replace(/\?.*$/g, "");
      const filesAndDirs = await getAllFilesAndDirs(fspath);

      const outstr =
        `export default ` + (await buildVFSTree(fspath, depth, filterSuffix));
      console.log("vfs done!");
      return {
        contents: outstr,
        loader: "ts",
        watchFiles: filesAndDirs.files,
        watchDirs: filesAndDirs.dirs,
      };
    });
  },
};

const lezerCache = new Map();

const lezerPlugin: esbuild.Plugin = {
  name: "lezer",
  setup(build) {
    build.onResolve({ filter: /.*\.lezer/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "lezer-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "lezer-ns" }, async (args) => {
      console.log("lezer start");
      let contents;
      if (lezerCache.get(args.path)) {
        contents = lezerCache.get(args.path);
      } else {
        const src = (await fs.readFile(args.path)).toString();
        const files = buildParserFile(src, {
          typeScript: true,
          moduleStyle: "es",
        });
        contents = files.parser;
        lezerCache.set(args.path, contents);
      }
      console.log("lezer end");
      return {
        contents,
        watchFiles: [args.path],
        loader: "ts",
        resolveDir: "node_modules",
      };
    });
  },
};

function buildProgressPlugin(name: string): esbuild.Plugin {
  return {
    name: "build-progress",
    setup(build) {
      let startTime = 0;
      build.onStart(() => {
        console.log(name, "Build started!");
        startTime = Date.now();
      });

      build.onEnd((result) => {
        console.log(
          name,
          "Build took",
          Date.now() - startTime,
          "milliseconds."
        );
      });
    },
  };
}

(async () => {
  const ctx = await esbuild.context({
    entryPoints: ["src/index.tsx"],
    outdir: "dist",
    bundle: true,
    minify: true,
    sourcemap: true,
    splitting: true,
    metafile: true,
    format: "esm",
    plugins: [
      buildProgressPlugin("MAIN:"),
      lezerPlugin,
      rawQueryParamPlugin,
      rawDtsQueryParamPlugin,
      vfsBuilderPlugin,
      copy({
        resolveFrom: "cwd",
        assets: {
          from: ["./node_modules/esbuild-wasm/esbuild.wasm"],
          to: "./dist",
        },
        watch: true,
      }),
    ],
  });

  const ctxEvalbox = await esbuild.context({
    entryPoints: ["src/components/iframe-runtime/EvalboxGLWrapper.ts"],
    outdir: "dist/components/iframe-runtime",
    bundle: true,
    minify: true,
    sourcemap: true,
    format: "esm",
    plugins: [buildProgressPlugin("EVALBOX:")],
  });

  const ctxTypescriptLibraries = await esbuild.context({
    entryPoints: [
      "src/components/panel-types/text-editor-features/typescript-libraries.ts",
    ],
    outdir: "dist",
    bundle: true,
    minify: true,
    sourcemap: true,
    format: "esm",
    plugins: [buildProgressPlugin("TYPESCRIPT LIBS:"), vfsBuilderPlugin],
  });

  const ctxEvalboxDefs = await esbuild.context({
    entryPoints: ["src/components/iframe-runtime/EvalboxDefsWrapper.ts"],
    outdir: "dist",
    bundle: true,
    minify: true,
    sourcemap: true,
    format: "esm",
    plugins: [buildProgressPlugin("EVALBOX DEFS:"), rawDtsQueryParamPlugin],
  });

  console.log(await esbuild.analyzeMetafile((await ctx.rebuild()).metafile));

  const contexts = [ctx, ctxEvalbox, ctxTypescriptLibraries, ctxEvalboxDefs];

  await Promise.all(contexts.map((c) => c.watch()));
})();
