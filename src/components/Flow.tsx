import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Edge,
  Node,
  NodeProps,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  OnReconnect,
  ReactFlow,
  reconnectEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useRef, useState } from "react";
import React from "react";
import GLSLFunctionNode, { GLSLFunctionNodeType } from "./GLSLFunctionNode";
import TextureNode, { TextureNodeType } from "./TextureNode";
import MeshDataNode, { MeshDataNodeType } from "./MeshDataNode";
import RasterizerNode, { RasterizerNodeType } from "./RasterizerNode";
import UniformNode, { UniformNodeType } from "./UniformNode";

const initialNodes: CustomNode[] = [
  {
    id: "1",
    type: "GLSLFunctionNode",
    data: {
      src: "float add(float a, float b) {\n  return a + b;\n}",
      type: "raw",
    },
    position: { x: 250, y: 25 },
  },
  {
    id: "2",
    type: "GLSLFunctionNode",
    data: {
      src: "float add(float a, float b) {\n  return a + b;\n}",
      type: "raw",
    },
    position: { x: 250, y: 250 },
  },
];

export type CustomNode =
  | GLSLFunctionNodeType
  | TextureNodeType
  | MeshDataNodeType
  | RasterizerNodeType
  | UniformNodeType;

const initialEdges: Edge[] = [];

const nodeTypes = {
  GLSLFunctionNode,
  TextureNode,
  MeshDataNode,
  RasterizerNode,
  UniformNode,
};

function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange: OnNodesChange<CustomNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const edgeReconnectSuccessful = useRef(true);

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect: OnReconnect<Edge> = useCallback(
    (oldEdge, newConnection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    []
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }

      edgeReconnectSuccessful.current = true;
    },
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onReconnect={onReconnect}
      onReconnectStart={onReconnectStart}
      onReconnectEnd={onReconnectEnd}
      nodeTypes={nodeTypes}
      fitView
    />
  );
}

export default Flow;
