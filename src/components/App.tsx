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
import { v4 } from "uuid";
import { PanelContents } from "./panel-types/PanelSelector";
import { Panel } from "./panel-types/Panel";

export function App() {
  const [panels, setPanels] = useState<PanelLayoutData<PanelContents>>([
    {
      proportion: 1,
      variant: { type: "data", data: { type: "none" } },
      id: "a",
    },
  ]);

  return (
    <RootPanelLayout
      panels={panels}
      setPanels={setPanels}
      panelComponent={Panel}
      vertical={false}
      defaultEmptyConfiguration={[
        {
          proportion: 1,
          variant: { type: "data", data: { type: "none" } },
          id: v4(),
        },
      ]}
    ></RootPanelLayout>
  );
}
