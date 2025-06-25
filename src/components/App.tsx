import React, { useState } from "react";
import Flow from "./Flow";
import { GLSLEditor } from "./GLSLEditor";
import { Divider } from "./Divider";

export function App() {
  const [text, setText] = useState<string>("");

  const [fraction, setFraction] = useState(0.5);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div style={{ width: `${fraction * 100}%` }}>
        <Flow></Flow>
      </div>
      <Divider fraction={fraction} setFraction={setFraction}></Divider>
      <div style={{ width: `${(1 - fraction) * 100}%` }}>
        <GLSLEditor text={text} setText={setText}></GLSLEditor>
      </div>
    </div>
  );
}
