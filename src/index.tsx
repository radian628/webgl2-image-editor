import { createRoot } from "react-dom/client";
import React from "react";
import "@xyflow/react/dist/style.css";
import Flow from "./components/Flow";
import "./index.css";

createRoot(document.getElementById("root")!).render(<Flow></Flow>);
