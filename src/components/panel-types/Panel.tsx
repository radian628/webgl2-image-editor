import React from "react";
import {
  PanelComponent,
  PanelComponentProps,
  PanelLayoutData,
} from "../panel-layout/Panels";
import { PanelContents, PanelSelector } from "./PanelSelector";
import { PanelMenu } from "../panel-layout/PanelMenu";
import "./Panel.css";
import { FilesystemPanel } from "./FilesystemPanel";

export const Panel: PanelComponent<PanelContents> = (
  props: PanelComponentProps<PanelContents>
) => (
  <div
    style={{
      backgroundImage: `linear-gradient(45deg, black, white)`,
      height: "100%",
    }}
  >
    <PanelMenu
      index={props.index}
      panels={props.panels}
      setPanels={props.setPanels}
      inVertical={props.inVertical}
      newPanelState={{
        type: "none",
      }}
    ></PanelMenu>
    {props.data.type === "none" ? (
      <div className="centered-big-panel-selector">
        <PanelSelector showAll {...props}></PanelSelector>
      </div>
    ) : (
      <PanelSelector {...props}></PanelSelector>
    )}
    {props.data.type === "filesystem" ? (
      <FilesystemPanel {...props} data={props.data}></FilesystemPanel>
    ) : (
      <></>
    )}
  </div>
);
