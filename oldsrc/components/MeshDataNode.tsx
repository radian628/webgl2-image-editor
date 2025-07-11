import { Node, NodeProps } from "@xyflow/react";
import React from "react";
import { z } from "zod";

type MeshDataNodeData = {
  type: "json";
  src: string;
};

export type MeshDataNodeType = Node<MeshDataNodeData, "MeshDataNode">;

export const meshDataJsonParser = z.array(
  z.object({
    name: z.string(),
    value: z.array(z.number()),
    count: z.number().refine((n) => n === 1 || n === 2 || n === 3 || n === 4),
    encoding: z.string().refine((n) => {
      return (
        n === "float" ||
        n === "int" ||
        n === "normalized-int" ||
        n === "uint" ||
        n === "normalized-uint"
      );
    }),
    size: z.number().refine((n) => n === 8 || n === 16 || n === 32),
  })
);

export default function MeshDataNode(props: NodeProps<MeshDataNodeType>) {
  return <div className="graph-node"></div>;
}
