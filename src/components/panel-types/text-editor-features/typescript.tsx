import * as ts from "typescript";
import { FilesystemAdaptor } from "../../../filesystem/FilesystemAdaptor";
import { Diagnostic, linter } from "@codemirror/lint";
import TypescriptLib from "../../../../node_modules/typescript/lib/lib.d.ts?raw";
import TypescriptDomLib from "../../../../node_modules/typescript/lib/lib.dom.d.ts?raw";
import TypescriptES5Lib from "../../../../node_modules/typescript/lib/lib.es5.d.ts?raw";
import EvalboxDefs from "../../iframe-runtime/EvalboxDefs.ts?dtstext";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import {
  autocompletion,
  completeFromList,
  CompletionContext,
} from "@codemirror/autocomplete";
import { EditorState, StateField } from "@codemirror/state";
import { showTooltip, Tooltip } from "@codemirror/view";

export function typescriptLanguageService(
  rootFileNames: string[],
  entryPoint: string,
  fs: FilesystemAdaptor,
  cwd: string,
  options: ts.CompilerOptions
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

  function getFunctionSigTooltip(state: EditorState): readonly Tooltip[] {
    files[entryPoint].version++;
    unsavedWork = state.sliceDoc(0, state.doc.length);

    return state.selection.ranges.flatMap((range) => {
      const sig = services.getSignatureHelpItems(entryPoint, range.from, {});

      if (!sig || sig.items.length === 0) return [];

      return [
        {
          pos: range.head,
          above: true,
          strictSide: true,
          create: () => {
            const dom = document.createElement("div");
            dom.innerHTML +=
              sig.items[0].prefixDisplayParts.map((p) => p.text).join("") +
              sig.items[0].parameters
                .map((p, i) => {
                  const display = p.displayParts.map((d) => d.text).join("");
                  return i === sig.argumentIndex
                    ? `<strong>${display}</strong>`
                    : display;
                })
                .join(
                  sig.items[0].separatorDisplayParts.map((p) => p.text).join("")
                ) +
              sig.items[0].suffixDisplayParts.map((p) => p.text).join("");
            return { dom };
          },
        },
      ];
    });
  }

  return [
    StateField.define<readonly Tooltip[]>({
      create: getFunctionSigTooltip,

      update(tooltips, t) {
        if (!t.docChanged && !t.selection) {
          return tooltips;
        }
        return getFunctionSigTooltip(t.state);
      },

      provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
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
                : matchBefore?.from ?? context.pos,

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
  ];
}
