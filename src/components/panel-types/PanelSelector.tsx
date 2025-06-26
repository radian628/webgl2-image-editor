import React from "react";
import { PanelComponentProps } from "../panel-layout/Panels";
import { SelectField } from "../fields/SelectField";

export type FilesystemAdaptor = {
  readdir: (path: string) => Promise<string[] | undefined>;
  readFile: (path: string) => Promise<Blob | undefined>;
  writeFile: (path: string, contents: Blob) => Promise<Blob>;
};

export type PanelContents =
  | {
      type: "none";
    }
  | {
      type: "filesystem";
      adaptor: FilesystemAdaptor | undefined;
    }
  | {
      type: "shader-editor";
    }
  | {
      type: "pipeline-editor";
    }
  | {
      type: "image-preview";
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
        ]}
        setValue={(v) => {
          if (v === "none") {
            props.setData({
              type: "none",
            });
          } else if (v === "filesystem") {
            props.setData({
              type: "filesystem",
              adaptor: undefined,
            });
          } else if (v === "shader-editor") {
            props.setData({
              type: "shader-editor",
            });
          } else if (v === "image-preview") {
            props.setData({
              type: "image-preview",
            });
          } else if (v === "pipeline-editor") {
            props.setData({
              type: "pipeline-editor",
            });
          }
        }}
        showAll={props.showAll}
      ></SelectField>
    </div>
  );
}
