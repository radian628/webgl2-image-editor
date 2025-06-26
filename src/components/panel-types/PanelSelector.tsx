import React from "react";
import { PanelComponentProps } from "../panel-layout/Panels";
import { SelectField } from "../fields/SelectField";
import {
  createVirtualFilesystem,
  FilesystemAdaptor,
} from "../../filesystem/FilesystemAdaptor";

type FileReference = {
  path: string;
  fs: FilesystemAdaptor;
};

export type PanelContents =
  | {
      type: "none";
    }
  | {
      type: "filesystem";
      adaptor: FilesystemAdaptor | undefined;
      openDir: string | undefined;
    }
  | {
      type: "shader-editor";
      file: FileReference | undefined;
    }
  | {
      type: "pipeline-editor";
      file: FileReference | undefined;
    }
  | {
      type: "image-preview";
    }
  | {
      type: "text-editor";
      file: FileReference | undefined;
    };

export type PanelContentsType<T extends PanelContents["type"]> =
  PanelContents & { type: T };

export function PanelSelector(
  props: PanelComponentProps<PanelContents> & { showAll?: boolean }
) {
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
        ]}
        setValue={(v) => {
          if (v === "none") {
            props.setData({
              type: "none",
            });
          } else if (v === "filesystem") {
            props.setData({
              type: "filesystem",
              adaptor: createVirtualFilesystem({
                type: "dir",
                name: "root",
                contents: new Map([
                  ["a", { type: "file", name: "a", contents: new Blob([]) }],
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
                  ["c", { type: "file", name: "c", contents: new Blob([]) }],
                ]),
              }),
              openDir: "root",
            });
          } else if (v === "shader-editor") {
            props.setData({
              type: "shader-editor",
              file: undefined,
            });
          } else if (v === "image-preview") {
            props.setData({
              type: "image-preview",
            });
          } else if (v === "pipeline-editor") {
            props.setData({
              type: "pipeline-editor",
              file: undefined,
            });
          } else if (v === "text-editor") {
            props.setData({
              type: "text-editor",
              file: undefined,
            });
          }
        }}
        showAll={props.showAll}
      ></SelectField>
    </div>
  );
}
