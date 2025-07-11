import { Node, NodeProps } from "@xyflow/react";
import React from "react";

type TextureNodeData =
  | {
      type: "image";
      src: string;
    }
  | {
      type: "render-target";
    }
  | {
      type: "output";
    };

export type TextureNodeType = Node<TextureNodeData, "TextureNode">;

export default function TextureNode(props: NodeProps<TextureNodeType>) {
  return <div className="graph-node"></div>;
}
