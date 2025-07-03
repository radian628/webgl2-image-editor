import * as ts from "typescript";
import { FilesystemAdaptor } from "../../../filesystem/FilesystemAdaptor";
import { Diagnostic, linter } from "@codemirror/lint";
import TypescriptLib from "../../../../node_modules/typescript/lib/lib.d.ts?raw";
import TypescriptDomLib from "../../../../node_modules/typescript/lib/lib.dom.d.ts?raw";
import TypescriptES5Lib from "../../../../node_modules/typescript/lib/lib.es5.d.ts?raw";
import EvalboxDefs from "../../iframe-runtime/EvalboxDefs.ts?dtstext";
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
import { hoverTooltip, showTooltip, Tooltip } from "@codemirror/view";
import { parseGLSLWithoutPreprocessing } from "../../../glsl-analyzer/parser-combined";
import { getInputsOutputsAndUniforms } from "../../../glsl-analyzer/get-inputs-outputs";
import { watchForStaticallyInferredShaders } from "./statically-inferred-shaders";
import * as prettier from "prettier";
import * as prettierPluginTypescript from "prettier/plugins/typescript";
import * as prettierPluginEstree from "prettier/plugins/estree";
import { JSX } from "react";
import React from "react";

function formatTypescriptFragment(str: string) {
  return prettier.format(str, {
    plugins: [prettierPluginTypescript, prettierPluginEstree],
    parser: "typescript",
    objectWrap: "collapse",
  });
}

export function typescriptLanguageService(
  rootFileNames: string[],
  entryPoint: string,
  fs: FilesystemAdaptor,
  cwd: string,
  options: ts.CompilerOptions,
  setDocumentation: (c: () => JSX.Element) => void
) {
  const files: ts.MapLike<{ version: number }> = {};

  rootFileNames.forEach((fileName) => {
    files[fileName] = { version: 0 };
  });

  const snapshots = new Map<string, string | null>();

  let unsavedWork: string | undefined;

  async function loadFile(fileName: string) {
    const fileContents = (await (await fs.readFile(fileName))?.text()) ?? null;
    snapshots.set(fileName, fileContents);
  }

  let staticallyInferredFilesSource = "";

  watchForStaticallyInferredShaders(fs, (shaders) => {
    staticallyInferredFilesSource = shaders;
    if (!files["@internal/StaticallyInferredFiles.d.ts"])
      files["@internal/StaticallyInferredFiles.d.ts"] = { version: 0 };
    files["@internal/StaticallyInferredFiles.d.ts"].version++;
  });

  function loadFileSync(fileName: string) {
    if (fileName === entryPoint) return unsavedWork ?? snapshots.get(fileName);
    if (fileName === "@internal/lib.d.ts") {
      return TypescriptLib;
    } else if (fileName === "@internal/dom.d.ts") {
      return TypescriptDomLib;
    } else if (fileName === "@internal/es5.d.ts") {
      return TypescriptES5Lib;
    } else if (fileName === "@internal/EvalboxDefs.d.ts") {
      return EvalboxDefs; //+ `export {clear} "components/iframe-runtime/EvalboxDefs";`;
      // `\ndeclare global { export { clear } from "components/iframe-runtime/EvalboxDefs"; } export {};`
    } else if (
      fileName === "@internal/components/iframe-runtime/EvalboxDefs.ts"
    ) {
      return "export {};";
    } else if (fileName === "@internal/StaticallyInferredFiles.d.ts") {
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
      if (!fileContents) return;

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
      return loadFileSync(path) ?? undefined;
    },
  };

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
