import React, { useEffect, useState } from "react";
import {
  PanelComponent,
  PanelComponentProps,
  PanelLayoutData,
  usePanelDragContext,
} from "../panel-layout/Panels";
import {
  PanelContents,
  PanelContentsItem,
  PanelSelector,
} from "./PanelSelector";
import { PanelMenu } from "../panel-layout/PanelMenu";
import "./Panel.css";
import { FilesystemPanel } from "./FilesystemPanel";
import { TextEditorPanel } from "./TextEditorPanel";
import { id, lens } from "../../utils/lens";
import { v4 } from "uuid";
import { ImagePreviewPanel } from "./ImagePreviewPanel";
import { DocumentationPanel } from "./DocumentationPanel";
import { CloseButtonNoBackground } from "../buttons/Close";
import { ImageEditorDragState } from "../ImageEditorPanels";

export const PanelItem = (props: {
  data: PanelContentsItem;
  setData: (i: (i: PanelContentsItem) => PanelContentsItem) => void;
}) => {
  return props.data.type === "none" ? (
    <div className="centered-big-panel-selector">
      <PanelSelector showAll {...props}></PanelSelector>
    </div>
  ) : (
    <>
      <PanelSelector showAll={false} {...props}></PanelSelector>
      {props.data.type === "filesystem" ? (
        <FilesystemPanel {...props} data={props.data}></FilesystemPanel>
      ) : props.data.type === "text-editor" ? (
        <TextEditorPanel {...props} data={props.data}></TextEditorPanel>
      ) : props.data.type === "image-preview" ? (
        <ImagePreviewPanel {...props} data={props.data}></ImagePreviewPanel>
      ) : props.data.type === "documentation" ? (
        <DocumentationPanel {...props} data={props.data}></DocumentationPanel>
      ) : (
        <></>
      )}
    </>
  );
};

function panelItemToName(item: PanelContentsItem) {
  if (item.type === "filesystem") {
    return "Files";
  }

  if (
    item.type === "text-editor" ||
    item.type === "shader-editor" ||
    item.type === "pipeline-editor"
  ) {
    return item.file?.path.split("/").at(-1) ?? "No Name";
  }

  if (item.type === "image-preview") {
    return `Run: ${item.file?.path.split("/").at(-1) ?? "No Name"}`;
  }

  return "Panel";
}

function PanelTab(
  props: PanelComponentProps<PanelContents> & {
    item: PanelContentsItem;
    index: number;
  }
) {
  const { item: i, index } = props;

  const [isMouseDown, setIsMouseDown] = useState(false);

  const drag = usePanelDragContext<PanelContents, ImageEditorDragState>();

  useEffect(() => {
    if (!isMouseDown) return;
    const mouseup = () => {
      setIsMouseDown(false);
    };
    document.addEventListener("mouseup", mouseup);
    return () => document.removeEventListener("mouseup", mouseup);
  }, [isMouseDown]);

  function removeThisTab() {
    props.setData((data) =>
      data.items.length === 1
        ? undefined
        : {
            openIndex: Math.max(0, data.openIndex - 1),
            items: data.items.filter((item, j) => j !== index),
          }
    );
  }

  return (
    <li
      className={index === props.data.openIndex ? "selected button" : "button"}
      key={i.id}
    >
      <span
        onClick={() => {
          props.setData((data) => ({
            ...data,
            openIndex: index,
          }));
        }}
        onMouseDown={() => {
          setIsMouseDown(true);
        }}
        onMouseMove={() => {
          if (!isMouseDown) return;
          removeThisTab();
          drag.setDragItem((d) => ({
            type: "item",
            item: props.item,
          }));
        }}
      >
        {panelItemToName(i)}
      </span>
      <CloseButtonNoBackground
        onClick={() => {
          removeThisTab();
        }}
      ></CloseButtonNoBackground>
    </li>
  );
}

export const Panel: PanelComponent<PanelContents> = (
  props: PanelComponentProps<PanelContents>
) => (
  <div className="panel-root">
    <PanelMenu
      index={props.index}
      panels={props.panels}
      setPanels={props.setPanels}
      inVertical={props.inVertical}
      newPanelState={{
        items: [{ type: "none", id: v4() }],
        openIndex: 0,
      }}
    ></PanelMenu>
    <ul className="panel-tabs">
      {props.data.items.map((i, index) => (
        <PanelTab {...props} item={i} index={index}></PanelTab>
      ))}
    </ul>
    <PanelItem
      data={props.data.items[props.data.openIndex]}
      setData={(data) => {
        props.setData((panelContents) =>
          lens(panelContents).items.$e((e, i) =>
            i === panelContents.openIndex ? e.$(data) : e.$(id)
          )
        );
      }}
    ></PanelItem>
  </div>
);
