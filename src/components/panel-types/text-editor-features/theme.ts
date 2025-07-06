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
  },
  { dark: true }
);
