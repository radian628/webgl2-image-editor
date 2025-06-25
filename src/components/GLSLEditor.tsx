import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { search, searchKeymap } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";
import "./GLSLEditor.css";

export function GLSLEditor(props: {
  text: string;
  setText: (text: string) => void;
}) {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const initState = EditorState.create({
      doc: props.text,
      extensions: [
        EditorView.lineWrapping,
        keymap.of(defaultKeymap),
        keymap.of(searchKeymap),
        search(),
        oneDark,

        keymap.of([indentWithTab]),
      ],
    });

    const view = new EditorView({
      state: initState,
      parent: container,
    });
  }, []);

  return <div className="glsl-editor-container" ref={editorContainerRef}></div>;
}
