import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { EditorView } from "codemirror";

export const defaultSyntaxHighlightTheme = HighlightStyle.define([
  {
    tag: t.keyword,
    color: "var(--keyword-color)",
  },
  {
    tag: t.variableName,
    color: "var(--variable-name-color)",
  },
  {
    tag: t.bool,
    color: "var(--bool-color)",
  },
  { tag: t.float, color: "var(--float-color)" },
  { tag: t.integer, color: "var(--int-color)" },
  { tag: t.number, color: "var(--number-color)" },
  { tag: t.literal, color: "var(--literal-color)" },
  { tag: t.string, color: "var(--string-literal-color)" },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: "var(--function-color)",
  },
  { tag: t.propertyName, color: "var(--property-color)" },
  { tag: [t.typeName, t.className], color: "var(--type-name)" },
]);

const defaultColorScheme = {
  backgroundColor: "var(--background-color)",
  color: "var(--foreground-color)",
};

export const defaultEditorTheme = EditorView.theme(
  {
    "&": {
      ...defaultColorScheme,
    },

    ".cm-gutters": {
      ...defaultColorScheme,
    },

    ".cm-activeLine": {
      backgroundColor: "var(--background-color-subtle)",
    },

    ".cm-lintRange-error": {
      backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="6" height="3">%3Cpath%20d%3D%22m0%202.5%20l2%20-1.5%20l1%200%20l2%201.5%20l1%200%22%20stroke%3D%22${encodeURIComponent(
        getComputedStyle(document.body).getPropertyValue("--error-color")
      )}%22%20fill%3D%22none%22%20stroke-width%3D%22.7%22%2F%3E</svg>')`,
    },

    ".cm-foldPlaceholder": {
      backgroundColor: "var(--background-color-2)",
      border: "1px solid var(--border-color)",
      color: "var(--highlight-color)",
    },
  },
  { dark: true }
);
