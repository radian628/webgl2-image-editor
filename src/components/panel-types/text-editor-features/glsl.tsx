import {
  Decoration,
  DecorationSet,
  EditorView,
  showTooltip,
  Tooltip,
} from "@codemirror/view";
import { Extension, StateField } from "@codemirror/state";
import { parseGLSLWithoutPreprocessing } from "../../../glsl-analyzer/parser-combined";
import { mapAST } from "../../../glsl-analyzer/glsl-ast-utils";
import { id } from "../../../utils/lens";
import {
  createOverridableVirtualFilesystem,
  FilesystemAdaptor,
} from "../../../filesystem/FilesystemAdaptor";
import {
  GLSLSignatureHelp,
  makeGLSLLanguageServer,
} from "../../../glsl-analyzer/langserver/glsl-language-server";
import {
  autocompletion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { makeFancyFormatter } from "../../../glsl-analyzer/formatter/fmt-fancy";
import { linter } from "@codemirror/lint";
import { tags } from "@lezer/highlight";
import { parser } from "./glsl-grammar.lezer";

const identifierMark = Decoration.mark({});

console.log(parser);

export function glslLanguageService(ctx: {
  fs: FilesystemAdaptor;
  entryPoint: string;
}): Extension {
  const fs = createOverridableVirtualFilesystem(ctx.fs);
  const server = makeGLSLLanguageServer({
    fs,
  });

  return [
    linter(async (view) => {
      fs.overrideFile(
        ctx.entryPoint,
        new Blob([view.state.sliceDoc(0, view.state.doc.length)])
      );

      const diagnostics = await server.getDiagnostics(ctx.entryPoint);

      if (!diagnostics) return [];

      return diagnostics.map((d) => ({
        from: d.start,
        to: d.end,
        message: d.why,
        severity: "error",
      }));
    }),
    StateField.define<
      { help: Promise<GLSLSignatureHelp | undefined>; pos: number }[]
    >({
      create: () => [],

      update(tooltips, t) {
        if (!t.docChanged && !t.selection) {
          return tooltips;
        }

        if (!t.selection) return [];

        fs.overrideFile(
          ctx.entryPoint,
          new Blob([t.state.sliceDoc(0, t.state.doc.length)])
        );

        return t.selection.ranges.map((r) => ({
          help: server.getSignatureHelp(ctx.entryPoint, r.from),
          pos: r.from,
        }));
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
                  const help = await tt.help;
                  if (help) {
                    dom.innerText = makeFancyFormatter(80, 2).functionPrototype(
                      help.signature
                    );
                  }
                })();
                return { dom };
              },
            };
          });
        }),
    }),
    autocompletion({
      override: [
        async (context: CompletionContext): Promise<CompletionResult> => {
          const completions = await server.getAutocompleteOptions(
            ctx.entryPoint,
            context.pos
          );

          fs.overrideFile(
            ctx.entryPoint,
            new Blob([context.state.sliceDoc(0, context.state.doc.length)])
          );

          const matchBefore = context.matchBefore(/[a-zA-Z_]+|\./);

          return {
            from: matchBefore?.from ?? context.pos,
            options: completions.map((c) => {
              return {
                type: c.type,
                label: c.str,
              };
            }),
          };
        },
      ],
    }),
    StateField.define<DecorationSet>({
      create() {
        return Decoration.none;
      },

      update(deco, tr) {
        const fullDoc = tr.state.sliceDoc(0, tr.state.doc.length);
        const docWithoutVersion300ES = fullDoc.replace(
          /^\s*#version\s+300\s+es/g,
          ""
        );
        const parsed = parseGLSLWithoutPreprocessing(docWithoutVersion300ES);
        const deltaSize = fullDoc.length - docWithoutVersion300ES.length;
        if (!parsed.data.success) return Decoration.none;

        let decorations = Decoration.none;

        mapAST(parsed.data.data.translationUnit, {
          expr(e, i) {
            i(e);
            if (e.data.type === "ident") {
              decorations = decorations.update({
                add: [
                  identifierMark.range(
                    e.range.start + deltaSize,
                    e.range.end + deltaSize
                  ),
                ],
              });
            }
            return e;
          },
        });

        return decorations;
      },

      provide: (f) => EditorView.decorations.from(f),
    }),
  ];
}
