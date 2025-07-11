import { Node, NodeProps } from "@xyflow/react";
import React from "react";

type RasterizerNodeData = {};

export type RasterizerNodeType = Node<RasterizerNodeData, "RasterizerNode">;

export default function RasterizerNode(props: NodeProps<RasterizerNodeType>) {
  return <div className="graph-node"></div>;
}
