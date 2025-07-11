import type ts from "typescript";
import {
  FilesystemAdaptor,
  VirtualFilesystemTree,
} from "../../../filesystem/fs-protocol/FilesystemAdaptor";
import { Diagnostic, linter } from "@codemirror/lint";
import {
  javascript,
  javascriptLanguage,
  typescriptLanguage,
} from "@codemirror/lang-javascript";
import {
  autocompletion,
  completeFromList,
  CompletionContext,
} from "@codemirror/autocomplete";
import { EditorState, StateField } from "@codemirror/state";
import type { Tooltip } from "@codemirror/view";
import { getInputsOutputsAndUniforms } from "../../glsl/typechecker/get-inputs-outputs";
import { watchForStaticallyInferredShaders } from "../../glsl/editor/statically-inferred-shaders";
import { JSX } from "react";
import React from "react";
import { hoverTooltip, showTooltip } from "@codemirror/view";

let cachedTypescript: typeof import("typescript");
export async function typescript() {
  if (cachedTypescript) return cachedTypescript;
  cachedTypescript = (await import("typescript")).default;
  return cachedTypescript;
}

let tslibsLoaded = false;
const tslibText: Record<string, string> = {};

export async function getPrettier() {
  return {
    prettier: await import("prettier"),
    typescript: await import("prettier/plugins/typescript"),
    estree: (await import("prettier/plugins/estree")).default,
  };
}

/// <reference path="../../../../types/global.d.ts" />

async function formatTypescriptFragment(str: string) {
  return await (
    await import("prettier")
  ).format(str, {
    plugins: [
      await import("prettier/plugins/typescript"),
      (await import("prettier/plugins/estree")).default,
    ],
    parser: "typescript",
    objectWrap: "collapse",
  });
}

export async function typescriptLanguageService(
  rootFileNames: string[],
  entryPoint: string,
  fs: FilesystemAdaptor,
  cwd: string,
  options: ts.CompilerOptions,
  setDocumentation: (c: () => JSX.Element) => void
) {
  const ts = await typescript();

  const tslibsStr: string = "./typescript-libraries.js";

  const TypescriptLibraries = (await import(tslibsStr)).default;
  if (TypescriptLibraries.type === "dir") {
    for (const [k, v] of TypescriptLibraries.contents) {
      if (v.type === "file") {
        const text = await v.contents.text();
        tslibText["@internal/" + k.replace(/^lib\./g, "")] = text;
        tslibText["@internal/" + k] = text;
      }
    }
    tslibsLoaded = true;
  }

  const evalboxdefsStr: string = "./EvalboxDefsWrapper.js";
  const EvalboxDefs: VirtualFilesystemTree = (await import(evalboxdefsStr))
    .default;
  // console.log(EvalboxDefs);

  const evalboxDefs: Record<string, string> = {};

  async function unwrapEvalboxDefs(vfs: VirtualFilesystemTree, path: string) {
    if (vfs.type === "dir") {
      for (const [k, v] of vfs.contents) {
        await unwrapEvalboxDefs(v, `${path}/${k}`);
      }
    } else {
      // console.log(path);
      evalboxDefs[path] = await vfs.contents.text();
    }
  }

  await unwrapEvalboxDefs(EvalboxDefs, "@internal");

  // console.log("EVALBOX DEFS", EvalboxDefs.keys());

  const files: ts.MapLike<{ version: number }> = {};

  rootFileNames.forEach((fileName) => {
    files[fileName] = { version: 0 };
  });

  const snapshots = new Map<string, string | null>();

  let unsavedWork: string | undefined;

  async function loadFile(fileName: string) {
    const fileContents = (await (await fs.readFile(fileName))?.text()) ?? null;
    if (snapshots.get(fileName) !== fileContents) {
      files[fileName] = files[fileName]
        ? { version: files[fileName].version + 1 }
        : { version: 0 };
    }
    snapshots.set(fileName, fileContents);
  }

  let staticallyInferredFilesSource = "";

  watchForStaticallyInferredShaders(fs, (shaders) => {
    staticallyInferredFilesSource = shaders;
    if (!files["@internal/StaticallyInferredFiles.d.ts"])
      files["@internal/StaticallyInferredFiles.d.ts"] = { version: 0 };
    files["@internal/StaticallyInferredFiles.d.ts"].version++;
  });

  console.log(Object.keys(evalboxDefs));

  options = {
    ...options,
    // lib: [
    //   ...(options.lib ?? []),
    //   ...Object.keys(evalboxDefs).map((s) => s.replace("@internal/", "")),
    // ],
  };

  console.log(options);

  function loadFileSync(fileName: string) {
    // console.log("file access attempt", fileName);
    // if (fileName.startsWith("root/@internal")) {
    //   console.log("weird file", fileName);
    // }
    fileName = fileName.replace(/^(root\/)+\@internal/g, "@internal");
    if (tslibText[fileName]) {
      return tslibText[fileName];
    } else if (evalboxDefs[fileName]) {
      // console.log("got from evalbox defs", fileName);
      // console.log(evalboxDefs[fileName]);
      // console.log(
      //   "FOUND IN EVALBOX DEFS",
      //   fileName,
      //   "\n"
      //   // evalboxDefs[fileName]
      // );
      console.log("FOUND THIS HERE", fileName);
      return evalboxDefs[fileName];
    }
    // if (fileName.startsWith("@internal")) console.log(fileName);
    if (fileName === entryPoint) return unsavedWork ?? snapshots.get(fileName);
    if (fileName === "@internal/EvalboxDefs.d.ts") {
      return ""; //EvalboxDefs; //+ `export {clear} "components/iframe-runtime/EvalboxDefs";`;
      // `\ndeclare global { export { clear } from "components/iframe-runtime/EvalboxDefs"; } export {};`
    } else if (fileName === "@internal/evalbox/definitions/EvalboxDefs.ts") {
      return "export {};";
    } else if (fileName === "@internal/StaticallyInferredFiles.d.ts") {
      console.log(staticallyInferredFilesSource);
      return staticallyInferredFilesSource;
    }
    return snapshots.get(fileName);
  }

  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: (fileName) =>
      files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: (fileName) => {
      let fileContents = loadFileSync(fileName);
      loadFile(fileName);
      if (fileContents === null || fileContents === undefined) return;

      return ts.ScriptSnapshot.fromString(fileContents);
    },
    getCurrentDirectory: () => cwd,
    getCompilationSettings: () => options,
    getDefaultLibFileName: (options) => "@internal/lib",
    fileExists: (path) => {
      loadFile(path);
      return loadFileSync(path) ? true : false;
    },
    readFile: (path) => {
      loadFile(path);
      const loadedFile = loadFileSync(path);
      if (loadedFile === null) return undefined;
      return loadedFile;
    },
  };

  const check = () => {
    console.log(
      services.getSemanticDiagnostics(
        "@internal/src/evalbox/definitions/EvalboxDefs.d.ts"
      )
    );
    console.log(
      services.getSemanticDiagnostics(
        "root/@internal/src/evalbox/runtime/GLMessageClient.d.ts"
      )
    );
    console.log(
      services.getSemanticDiagnostics(
        "root/@internal/src/gl-message/protocol/GLMessageProtocol.d.ts"
      )
    );
    console.log(
      services.getSemanticDiagnostics("@internal/StaticallyInferredFiles.d.ts"),
      services.getSyntacticDiagnostics("@internal/StaticallyInferredFiles.d.ts")
    );
    console.log(
      services.getSemanticDiagnostics(
        "root/@internal/src/evalbox/runtime/EvalboxUIWrapper.d.ts"
      )
    );
    console.log(
      services.getSemanticDiagnostics(
        "root/root/@internal/src/components/gl-message-ui/GLMessageUI.d.ts"
      )
    );
  };

  setTimeout(check, 1000);
  setTimeout(check, 2000);
  setTimeout(check, 3000);

  const services = ts.createLanguageService(
    servicesHost,
    ts.createDocumentRegistry()
  );

  function getFunctionSigTooltip(
    state: EditorState
  ): { tooltip: HTMLElement[]; pos: number }[] {
    files[entryPoint].version++;
    unsavedWork = state.sliceDoc(0, state.doc.length);

    const tooltips = state.selection.ranges.flatMap((range) => {
      const sig = services.getSignatureHelpItems(entryPoint, range.from, {});

      if (!sig || sig.items.length === 0) return [];

      const wrapSpan = (s: string, styling?: string) => {
        const span = document.createElement("span");
        span.style = styling ?? "color: #cccccc";
        span.innerText = s;
        return span;
      };

      const display: HTMLElement[] = [
        wrapSpan(sig.items[0].prefixDisplayParts.map((p) => p.text).join("")),
        wrapSpan("\n"),
        ...sig.items[0].parameters
          .map((p, i) => {
            const display = p.displayParts.map((d) => d.text).join("");
            return i === sig.argumentIndex ? `${display}` : display;
          })
          .map((s, i) =>
            wrapSpan(
              `  ${s}${
                sig.items[0].separatorDisplayParts.map((p) => p.text).join("") +
                "\n"
              }`,
              i === sig.argumentIndex
                ? "font-weight: bold; color: #fff"
                : "color: #ccc"
            )
          ),
        wrapSpan("\n"),
        wrapSpan(sig.items[0].suffixDisplayParts.map((p) => p.text).join("")),
      ];

      return [{ tooltip: display, pos: range.from }];
    });

    if (tooltips[0]) {
      setDocumentation(() => {
        return (
          <div
            style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
            ref={(e) => {
              for (const elem of tooltips[0].tooltip) e?.appendChild(elem);
            }}
          ></div>
        );
      });
    }

    return tooltips;
  }

  return [
    javascript({ typescript: true }),
    hoverTooltip(async (view, pos, side) => {
      const tooltip = services.getQuickInfoAtPosition(entryPoint, pos);

      let display = tooltip?.displayParts?.map((d) => d.text)?.join("");
      if (!display) return null;
      try {
        display = await formatTypescriptFragment(display);
      } catch {}

      return {
        pos,
        create() {
          const dom = document.createElement("div");
          dom.style.whiteSpace = "pre";

          dom.innerText = display;
          return {
            dom,
          };
        },
      };
    }),
    StateField.define<readonly { tooltip: HTMLElement[]; pos: number }[]>({
      create: getFunctionSigTooltip,

      update(tooltips, t) {
        if (!t.docChanged && !t.selection) {
          return tooltips;
        }
        return getFunctionSigTooltip(t.state);
      },

      provide: (f) =>
        showTooltip.computeN([f], (state) => {
          const field = state.field(f);
          return field.map((tt) => {
            return {
              pos: tt.pos,
              above: true,
              create() {
                const dom = document.createElement("div");
                dom.style.whiteSpace = "pre";
                (async () => {
                  // dom.innerText = await formatTypescriptFragment(tt.tooltip);
                  for (const e of tt.tooltip) dom.appendChild(e);
                })();
                return { dom };
              },
            } satisfies Tooltip;
          });
        }),
    }),

    linter((view) => {
      files[entryPoint].version++;
      unsavedWork = view.state.sliceDoc(0, view.state.doc.length);

      const diagnostics = services
        .getCompilerOptionsDiagnostics()
        .concat(services.getSyntacticDiagnostics(entryPoint))
        .concat(services.getSemanticDiagnostics(entryPoint));

      return diagnostics.map((d) => {
        let msg = d.messageText;

        return {
          from: d.start ?? 0,
          to: (d?.start ?? 0) + (d?.length ?? 0),
          severity: "error",
          message:
            typeof d.messageText === "string"
              ? d.messageText
              : d.messageText.messageText,
        } satisfies Diagnostic;
      });
    }),

    autocompletion({
      override: [
        (context: CompletionContext) => {
          if (context.view) {
            files[entryPoint].version++;
            unsavedWork = context.view.state.sliceDoc(
              0,
              context.view.state.doc.length
            );
          }

          const triggerChar = context.matchBefore(/[."'`/@<# ]/);

          const matchBefore = context.matchBefore(/[a-zA-Z_]+|\./);

          if (!matchBefore && !context.explicit) return null;

          const completions = services.getCompletionsAtPosition(
            entryPoint,
            context.pos,
            {
              triggerCharacter: triggerChar
                ? (triggerChar.text as ts.CompletionsTriggerCharacter)
                : undefined,
              triggerKind: triggerChar
                ? ts.CompletionTriggerKind.TriggerCharacter
                : ts.CompletionTriggerKind.Invoked,
            },
            {}
          );

          if (!completions)
            return {
              from: context.pos,
              options: [],
            };

          return {
            from:
              matchBefore?.text === "."
                ? matchBefore.to
                : (matchBefore?.from ?? context.pos),

            options: completions.entries.flatMap((c) => {
              return [
                {
                  type: c.kind,
                  label: c.name,
                },
              ];

              return [];
            }),
          };
        },
      ],
    }),
    typescriptLanguage,
  ];
}
