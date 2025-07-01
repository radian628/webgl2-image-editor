import * as esbuild from "esbuild";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { copy } from "esbuild-plugin-copy";
import * as ts from "typescript";

// plugin for the ?raw query param
// to make "raw" resources use the text loader
const rawQueryParamPlugin = {
  name: "raw",
  setup(build) {
    build.onResolve({ filter: /\?.*raw/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "raw-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "raw-ns" }, async (args) => {
      return {
        contents: (
          await fs.readFile(args.path.replace(/\?.*$/, ""))
        ).toString(),
        loader: "text",
      };
    });
  },
};

const rawDtsQueryParamPlugin = {
  name: "dtstext",
  setup(build) {
    build.onResolve({ filter: /\?.*dtstext/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "dtstext-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "dtstext-ns" }, (args) => {
      const options = {
        declaration: true,
        emitDeclarationOnly: true,
        outFile: "EvalboxDefs.ts",
        isolatedModules: false,
      };
      return new Promise((resolve, reject) => {
        const host = ts.createCompilerHost(options);
        host.writeFile = (filename, contents) => {
          resolve({
            contents,
            loader: "text",
          });
        };
        const filename = args.path.replace(/\?.*$/, "");
        const program = ts.createProgram([filename], options, host);
        program.emit();
      });
    });
  },
};

async function buildVFSTree(link) {
  console.log(link);
  const isDir = (await fs.lstat(link)).isDirectory();
  if (isDir) {
    const contents = await Promise.all(
      (await fs.readdir(link)).map(async (l) => ({
        name: l,
        tree: await buildVFSTree(`${link}/${l}`),
      }))
    );
    return `{
  type: "dir",
  name: ${JSON.stringify(link.split("/").at(-1))},
  contents: new Map([${contents.map((c) => `[${JSON.stringify(c.name)}, ${c.tree}]`).join(",")}])
}`;
  } else {
    return `{
  type: "file",
  name: ${JSON.stringify(link.split("/").at(-1))},
  contents: new Blob([${JSON.stringify((await fs.readFile(link)).toString())}])   
}`;
  }
}

const vfsBuilderPlugin = {
  name: "vfs",
  setup(build) {
    build.onResolve({ filter: /\?.*vfs/ }, (args) => {
      return {
        path: path.join(args.resolveDir, args.path),
        namespace: "vfs-ns",
      };
    });
    build.onLoad({ filter: /.*/, namespace: "vfs-ns" }, async (args) => {
      console.log(args);
      const outstr =
        `export default ` + (await buildVFSTree(args.path.slice(0, -4)));
      console.log(outstr);
      return {
        contents: outstr,
        loader: "ts",
      };
    });
  },
};

const ctx = await esbuild.context({
  entryPoints: [
    "src/index.tsx",
    "src/components/iframe-runtime/EvalboxGLWrapper.ts",
  ],
  outdir: "dist",
  bundle: true,
  minify: true,
  sourcemap: true,
  plugins: [
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

await ctx.watch();
