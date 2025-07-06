import * as esbuild from "esbuild";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { copy } from "esbuild-plugin-copy";
import * as ts from "typescript";
import { buildParserFile } from "@lezer/generator";

// plugin for the ?raw query param
// to make "raw" resources use the text loader
const rawQueryParamPlugin = {
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
      return {
        contents: (
          await fs.readFile(args.path.replace(/\?.*$/, ""))
        ).toString(),
        loader: "text",
      };
    });
  },
};

const options = {
  declaration: true,
  emitDeclarationOnly: true,
  outFile: "EvalboxDefs.ts",
  isolatedModules: false,
};
const host = ts.createCompilerHost(options);
let tsindex = 0;

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
      const start = Date.now();
      return new Promise((resolve, reject) => {
        const filename = args.path.replace(/\?.*$/, "");
        let index = tsindex++;
        host.writeFile = (path, contents) => {
          console.log(path, index);
          if (path.endsWith(`${index}.d.ts`))
            resolve({
              contents,
              loader: "text",
            });
          const end = Date.now();
          console.log("dtstext time:", end - start);
        };
        const program = ts.createProgram(
          [filename],
          {
            ...options,
            outFile: `${index}.d.ts`,
          },
          host
        );
        program.emit();
      });
    });
  },
};

async function buildVFSTree(link, levels, filterSuffix) {
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

const vfsBuilderPlugin = {
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
      const search = new URLSearchParams(args.path.match(/\?.*$/g)[0]);
      let depth = parseInt(search.get("depth"));
      if (!depth) depth = Infinity;
      let filterSuffix = search.get("filterSuffix") ?? "";

      const outstr =
        `export default ` +
        (await buildVFSTree(
          args.path.replace(/\?.*$/g, ""),
          depth,
          filterSuffix
        ));
      console.log("vfs done!");
      return {
        contents: outstr,
        loader: "ts",
      };
    });
  },
};

const lezerCache = new Map();

const lezerPlugin = {
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

function buildProgressPlugin(name) {
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

// const ctxCodemirror = await esbuild.context({
//   entryPoints: ["src/components/iframe-runtime/EvalboxDefsWrapper.ts"],
//   outdir: "dist",
//   bundle: true,
//   minify: true,
//   sourcemap: true,
//   format: "esm",
//   plugins: [buildProgressPlugin("EVALBOX DEFS:"), rawDtsQueryParamPlugin],
// });

console.log(await esbuild.analyzeMetafile((await ctx.rebuild()).metafile));

const contexts = [ctx, ctxEvalbox, ctxTypescriptLibraries, ctxEvalboxDefs];

await Promise.all(contexts.map((c) => c.watch()));
