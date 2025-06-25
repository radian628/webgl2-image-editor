import { Node, NodeProps } from "@xyflow/react";
import React from "react";

type UniformNodeData = {
  type: "uniform";
  src: string;
};

export type UniformNodeType = Node<UniformNodeData, "UniformNode">;

export default function UniformNode(props: NodeProps<UniformNodeType>) {
  return <div className="uniform-node"></div>;
}
