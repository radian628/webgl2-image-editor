import { createRoot } from "react-dom/client";
import React from "react";
import "@xyflow/react/dist/style.css";
import Flow from "../../oldsrc/components/Flow";
import "./index.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App></App>);
