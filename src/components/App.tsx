import React, { useState } from "react";
import Flow from "./Flow";
import { GLSLEditor } from "./GLSLEditor";
import { Divider } from "./Divider";
import {
  PanelComponent,
  PanelLayoutData,
  RootPanelLayout,
} from "./panel-layout/Panels";
import { PanelMenu } from "./panel-layout/PanelMenu";

const panelComponent: PanelComponent<number> = (props: {
  data: number;
  setData: (d: number) => void;
  index: number;
  panels: PanelLayoutData<number>;
  setPanels: (
    f: (p: PanelLayoutData<number>) => PanelLayoutData<number>
  ) => void;
  inVertical: boolean;
}) => (
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
      newPanelState={69}
    ></PanelMenu>
    {props.data}
  </div>
);

export function App() {
  // const [text, setText] = useState<string>("");

  // const [fraction, setFraction] = useState(0.5);

  // return (
  //   <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
  //     <div style={{ width: `${fraction * 100}%` }}>
  //       <Flow></Flow>
  //     </div>
  //     <Divider fraction={fraction} setFraction={setFraction}></Divider>
  //     <div style={{ width: `${(1 - fraction) * 100}%` }}>
  //       <GLSLEditor text={text} setText={setText}></GLSLEditor>
  //     </div>
  //   </div>
  // );

  const [panels, setPanels] = useState<PanelLayoutData<number>>([
    {
      proportion: 0.25,
      variant: { type: "data", data: 1 },
      id: "a",
    },
    {
      proportion: 0.25,
      variant: { type: "data", data: 2 },
      id: "b",
    },
    {
      proportion: 0.25,
      variant: {
        type: "nested",
        subpanels: [
          {
            proportion: 0.5,
            variant: { type: "data", data: 3 },
            id: "e",
          },
          {
            proportion: 0.5,
            variant: { type: "data", data: 4 },
            id: "f",
          },
        ],
      },
      id: "c",
    },
    {
      proportion: 0.25,
      variant: { type: "data", data: 5 },
      id: "d",
    },
  ]);

  return (
    <RootPanelLayout
      panels={panels}
      setPanels={setPanels}
      panelComponent={panelComponent}
      vertical={false}
    ></RootPanelLayout>
  );
}
