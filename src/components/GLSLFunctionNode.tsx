import {
  NodeProps,
  Node,
  useReactFlow,
  Handle,
  Position,
  useUpdateNodeInternals,
} from "@xyflow/react";
import React, { JSX, useEffect } from "react";
import "./GLSLFunctionNode.css";
import { parseGLSLWithoutPreprocessing } from "../glsl-analyzer/parser-combined";
import {
  getFunctions,
  getNamedInputParameters,
  getNamedOutputParameters,
  getParameters,
} from "../glsl-analyzer/glsl-ast-utils";

type GLSLFunctionNodeData =
  | {
      type: "raw";
      src: string;
    }
  | {
      type: "from-source";
      fnName: string;
    };

export type GLSLFunctionNodeType = Node<
  GLSLFunctionNodeData,
  "GLSLFunctionNode"
>;

export default function GLSLFunctionNode(
  props: NodeProps<GLSLFunctionNodeType>
) {
  const rf = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(props.id);
  }, [props.data]);

  if (props.data.type === "from-source") {
    return <></>;
  }

  const ast = parseGLSLWithoutPreprocessing(props.data.src);

  let handles = (<></>) as JSX.Element;

  if (ast.data.success) {
    const fn = getFunctions(ast.data.data.translationUnit)[0];
    const inputs = getNamedInputParameters(fn);
    const outputs = getNamedOutputParameters(fn);

    handles = (
      <>
        {inputs.map((e, i) => (
          <Handle
            position={Position.Left}
            style={{
              top: `${((i + 1) / (inputs.length + 1)) * 100}%`,
            }}
            type="source"
            key={e.name}
            id={e.name}
          ></Handle>
        ))}
        {[{ name: "Return-Value" }, ...outputs].map((e, i) => (
          <Handle
            position={Position.Right}
            style={{
              top: `${((i + 1) / (outputs.length + 2)) * 100}%`,
            }}
            type="target"
            key={e.name}
            id={e.name}
          ></Handle>
        ))}
      </>
    );
  }

  return (
    <div className="graph-node glsl-function-node">
      {handles}
      <textarea
        className="nodrag"
        value={props.data.src}
        onChange={(e) => {
          rf.updateNodeData(props.id, { src: e.currentTarget.value });
        }}
      ></textarea>
    </div>
  );
}
