import React, { useEffect, useState } from "react";
import { PanelComponentProps } from "../panel-layout/Panels";
import { PanelContents } from "./PanelSelector";
import { FilesystemAdaptor } from "../../filesystem/FilesystemAdaptor";
import "./FilesystemPanel.css";

export function FileOrDirDisplay(props: {
  fs: FilesystemAdaptor;
  path: string;
  expandedMap: Map<string, boolean>;
  setExpandedMap: (map: Map<string, boolean>) => void;
}) {
  const { fs, path } = props;
  const [data, setData] = useState<
    | {
        type: "file";
        name: string;
      }
    | {
        type: "dir";
        name: string;
        contents?: string[];
      }
    | undefined
    | {
        type: "error";
        why?: string;
      }
  >();

  const expanded = props.expandedMap.get(props.path);

  useEffect(() => {
    (async () => {
      const isDir = await fs.isDir(path);
      if (isDir === undefined)
        return setData({ type: "error", why: `Cannot find '${path}'` });
      if (isDir) {
        if (expanded) {
          const dirContents = await fs.readDir(path);
          if (!dirContents)
            return setData({
              type: "error",
              why: `Cannot find contents of '${path}'`,
            });
          setData({
            type: "dir",
            name: path.split("/").at(-1) ?? "No Name",
            contents: dirContents,
          });
        } else {
          setData({
            type: "dir",
            name: path.split("/").at(-1) ?? "No Name",
          });
        }
      } else {
        setData({ type: "file", name: path.split("/").at(-1) ?? "No Name" });
      }
    })();
  }, [fs, path, expanded]);

  if (!data) return <div>Loading...</div>;

  if (data.type === "error")
    return (
      <div className="error-root">
        Error: {data.why ?? "No Error Message Provided"}
      </div>
    );

  if (data.type === "file") {
    return <div className="file-root">{data.name}</div>;
  }

  return (
    <div className="directory-root">
      <div
        className="directory-button"
        onClick={(e) => {
          props.setExpandedMap(
            new Map(props.expandedMap).set(
              props.path,
              !props.expandedMap.get(props.path)
            )
          );
        }}
      >
        {expanded ? "-" : "+"} {data.name}
      </div>
      {expanded && (
        <ul className="directory-list">
          {data.contents?.map((c) => (
            <li>
              <FileOrDirDisplay
                key={c}
                fs={fs}
                path={path + `/${c}`}
                expandedMap={props.expandedMap}
                setExpandedMap={props.setExpandedMap}
              ></FileOrDirDisplay>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FilesystemPanel(
  props: PanelComponentProps<PanelContents> & {
    data: {
      type: "filesystem";
    };
  }
) {
  // map to keep track of which paths are expanded or not
  const [expandedMap, setExpandedMap] = useState<Map<string, boolean>>(
    new Map()
  );

  return (
    <div className="filesystem-panel">
      {props.data.adaptor && props.data.openDir && (
        <FileOrDirDisplay
          fs={props.data.adaptor}
          path={props.data.openDir}
          expandedMap={expandedMap}
          setExpandedMap={setExpandedMap}
        ></FileOrDirDisplay>
      )}
    </div>
  );
}
