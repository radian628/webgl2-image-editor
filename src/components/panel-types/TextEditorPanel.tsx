import React, { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { EditorView, keymap } from "@codemirror/view";
import { search, searchKeymap } from "@codemirror/search";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  PanelComponentProps,
  usePanelDragContext,
} from "../panel-layout/Panels";
import { PanelContents, PanelContentsItem, PanelType } from "./PanelSelector";
import {
  javascript,
  javascriptLanguage,
  typescriptLanguage,
} from "@codemirror/lang-javascript";
import { typescriptLanguageService } from "./text-editor-features/typescript";
import ts from "typescript";
import { basicSetup } from "codemirror";
import { ImageEditorDragState } from "../ImageEditorPanels";
import { v4 } from "uuid";
import "./TextEditorPanel.css";
import { useDocumentation } from "./DocumentationPanel";

export function TextEditorPanel(props: {
  data: PanelType<"text-editor">;
  setData: (d: (d: PanelContentsItem) => PanelContentsItem) => void;
}) {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorView>(null);
  const { dragItem, setDragItem } = usePanelDragContext<
    PanelContents,
    ImageEditorDragState
  >();

  const [textLoaded, setTextLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const [documentation, setDocumentation] = useDocumentation();

  async function loadTextFromFile() {
    if (props.data.file) {
      const fileData = await props.data.file.fs.readFile(props.data.file.path);
      if (fileData) {
        const text = await fileData.text();
        resetEditor(text);
      }
    }
  }

  useEffect(() => {
    if (editorRef.current && editorRef.current.state !== props.data.state) {
      if (props.data.state) {
        editorRef.current.setState(props.data.state);
      } else {
        loadTextFromFile();
      }
    }
  }, [props.data.state, editorRef.current]);

  function resetEditor(text: string) {
    if (editorRef.current) {
      editorRef.current.destroy();
    }
    const container = editorContainerRef.current;
    if (!container) return;

    const initState =
      props.data.state ??
      EditorState.create({
        doc: text,
        extensions: [
          basicSetup,
          props.data.file?.path.endsWith(".ts")
            ? typescriptLanguageService(
                [props.data.file.path],
                props.data.file.path,
                props.data.file.fs,
                props.data.file.path.split("/").slice(0, -1).join("/"),
                {
                  lib: [
                    "dom",
                    "es5",
                    "EvalboxDefs",
                    "components/iframe-runtime/EvalboxDefs",
                    "StaticallyInferredFiles",
                  ],
                  target: ts.ScriptTarget.ES2024,
                  strict: true,
                  module: ts.ModuleKind.ESNext,
                },
                (docs) => {
                  setDocumentation({
                    component: docs,
                  });
                }
              )
            : [],
          EditorView.lineWrapping,
          keymap.of(defaultKeymap),
          keymap.of(searchKeymap),
          search(),
          oneDark,
          keymap.of([indentWithTab]),
          keymap.of([
            {
              key: "Mod-s",
              run: (view) => {
                (async () => {
                  if (props.data.file) {
                    await props.data.file.fs.writeFile(
                      props.data.file.path,
                      new Blob([view.state.sliceDoc(0, view.state.doc.length)])
                    );
                    setSaved(true);
                  }
                })();
                return true;
              },
            },
          ]),
          EditorView.updateListener.of((update) => {
            props.setData((data) => ({
              ...data,
              state: update.state,
            }));
            setSaved(false);
          }),
        ],
      });

    if (!props.data.state) {
      props.setData((data) => ({
        ...data,
        state: initState,
      }));
    }

    const view = new EditorView({
      state: initState,
      parent: container,
    });

    editorRef.current = view;
  }

  useEffect(() => {
    loadTextFromFile();
  }, []);

  return (
    <>
      <div
        onMouseDown={(e) => {
          setDragItem(() => ({
            type: "item",
            item: {
              type: "image-preview",
              file: props.data.file,
              id: v4(),
            },
          }));
        }}
        className="text-editor-get-preview"
      >
        Get Preview
      </div>
      <div className="glsl-editor-container" ref={editorContainerRef}></div>
    </>
  );
}
