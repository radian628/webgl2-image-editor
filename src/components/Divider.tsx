import React, { useEffect, useState } from "react";
import { createRef } from "react";

export function Divider(props: {
  fraction: number;
  setFraction: (f: (n: number) => number) => void;
}) {
  const rootRef = createRef<HTMLDivElement>();

  return (
    <div
      onMouseDown={() => {
        const mouseup = (e: MouseEvent) => {
          console.log("why");
          document.removeEventListener("mouseup", mouseup);
          document.removeEventListener("mousemove", mousemove);
        };

        const parentRect =
          rootRef.current?.parentElement?.getBoundingClientRect();

        const mousemove = (e: MouseEvent) => {
          if (!parentRect) return;
          props.setFraction((f) => f + e.movementX / parentRect.width);
        };

        document.addEventListener("mouseup", mouseup);
        document.addEventListener("mousemove", mousemove);
      }}
      ref={rootRef}
      style={{
        width: "10px",
        height: "100%",
        cursor: "w-resize",
        backgroundColor: "white",
      }}
    ></div>
  );
}
