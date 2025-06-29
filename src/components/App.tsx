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
import { ImageEditorPanels } from "./ImageEditorPanels";

export function App() {
  return <ImageEditorPanels></ImageEditorPanels>;
}
