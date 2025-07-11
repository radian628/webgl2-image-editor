import React, { useState } from "react";
import Flow from "../../oldsrc/components/Flow";
import { GLSLEditor } from "../../oldsrc/components/GLSLEditor";
import { Divider } from "../../oldsrc/components/Divider";
import {
  PanelComponent,
  PanelLayoutData,
  RootPanelLayout,
} from "../components/panels/core/Panels";
import { PanelMenu } from "../components/panels/core/PanelMenu";
import { v4 } from "uuid";
import { PanelContents } from "../components/input-fields/PanelSelector";
import { Panel } from "../components/panels/panel-types/Panel";
import { ImageEditorPanels } from "../components/panels/implementation/ImageEditorPanels";

export function App() {
  return <ImageEditorPanels></ImageEditorPanels>;
}
