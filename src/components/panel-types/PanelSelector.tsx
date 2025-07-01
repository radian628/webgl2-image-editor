import React from "react";
import { PanelComponentProps } from "../panel-layout/Panels";
import { SelectField } from "../fields/SelectField";
import {
  createVirtualFilesystem,
  FilesystemAdaptor,
} from "../../filesystem/FilesystemAdaptor";
import { EditorState } from "@codemirror/state";
import { v4 } from "uuid";
import Sample from "../../../sample.ts?raw";
import VFS from "../../../examples/single-pass?vfs";

type FileReference = {
  path: string;
  fs: FilesystemAdaptor;
};

export type PanelContentsItem =
  | {
      type: "none";
      id: string;
    }
  | {
      type: "filesystem";
      adaptor: FilesystemAdaptor | undefined;
      openDir: string | undefined;
      id: string;
    }
  | {
      type: "shader-editor";
      file: FileReference | undefined;
      id: string;
    }
  | {
      type: "pipeline-editor";
      file: FileReference | undefined;
      id: string;
    }
  | {
      type: "image-preview";
      file: FileReference | undefined;
      id: string;
    }
  | {
      type: "text-editor";
      file: FileReference | undefined;
      state?: EditorState;
      id: string;
    }
  | {
      type: "documentation";
      id: string;
    };

export type PanelType<T extends PanelContentsItem["type"]> =
  PanelContentsItem & { type: T };

export type PanelContents = {
  items: PanelContentsItem[];
  openIndex: number;
};

export function PanelSelector(props: {
  showAll: boolean;
  data: PanelContentsItem;
  setData: (i: (i: PanelContentsItem) => PanelContentsItem) => void;
}) {
  return (
    <div>
      <SelectField
        value={props.data.type}
        options={[
          ["none", "Select Panel Type"],
          ["filesystem", "File Browser"],
          ["shader-editor", "Shader Editor"],
          ["pipeline-editor", "Pipeline Editor"],
          ["image-preview", "Image Preview"],
          ["text-editor", "Text Editor"],
          ["documentation", "Documentation"],
        ]}
        setValue={(v) => {
          if (v === "none") {
            props.setData((data) => ({
              type: "none",
              id: v4(),
            }));
          } else if (v === "filesystem") {
            props.setData((data) => ({
              type: "filesystem",
              id: v4(),
              adaptor: createVirtualFilesystem(VFS) /* createVirtualFilesystem({
                type: "dir",
                name: "root",
                contents: new Map([
                  [
                    "a.ts",
                    {
                      type: "file",
                      name: "a.ts",
                      contents: new Blob([Sample]),
                    },
                  ],
                  [
                    "b",
                    {
                      type: "dir",
                      name: "b",
                      contents: new Map([
                        [
                          "d",
                          { type: "file", name: "d", contents: new Blob([]) },
                        ],
                        [
                          "e",
                          { type: "file", name: "e", contents: new Blob([]) },
                        ],
                      ]),
                    },
                  ],
                  [
                    "test.frag",
                    {
                      type: "file",
                      name: "test.frag",
                      contents: new Blob([
                        `#version 300 es
precision highp float;

in vec2 pos2;
out vec4 col; 

uniform float blue; 
uniform sampler2D tex; 
void main() { 
  col = vec4(texture(tex, pos2 * 0.5 + 0.5).rg, blue, 1.0); 
}`,
                      ]),
                    },
                  ],
                  [
                    "test.vert",
                    {
                      type: "file",
                      name: "test.vert",
                      contents: new Blob([
                        `#version 300 es\nprecision highp float;in vec2 pos;out vec2 pos2; void main() { pos2 = pos; gl_Position = vec4(pos, 0.5, 1.0); }`,
                      ]),
                    },
                  ],
                ]),
              })*/,
              openDir: "root",
            }));
          } else if (v === "shader-editor") {
            props.setData((data) => ({
              type: "shader-editor",
              file: undefined,
              id: v4(),
            }));
          } else if (v === "image-preview") {
            props.setData((data) => ({
              type: "image-preview",
              file: undefined,
              id: v4(),
            }));
          } else if (v === "pipeline-editor") {
            props.setData((data) => ({
              type: "pipeline-editor",
              file: undefined,
              id: v4(),
            }));
          } else if (v === "text-editor") {
            props.setData((data) => ({
              type: "text-editor",
              file: undefined,
              id: v4(),
            }));
          } else if (v === "documentation") {
            props.setData((data) => ({
              type: "documentation",
              id: v4(),
            }));
          }
        }}
        showAll={props.showAll}
      ></SelectField>
    </div>
  );
}
