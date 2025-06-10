import { getFunctions } from "../glsl-analyzer/glsl-ast-utils";
import {
  ASTNode,
  ExternalDeclaration,
  TranslationUnit,
} from "../glsl-analyzer/parser";
import { FormatGLSLPacked } from "../glsl-analyzer/fmt-packed";
import { err, ok, Result } from "../utils/result";
import { Table } from "../utils/table";

export type NodeTemplate =
  | {
      type: "glsl-function";
      src: TranslationUnit;
      fnName: string;
      id: number;
      inputs: () => string[];
      outputs: () => string[];
    }
  | {
      type: "input";
      inputs: string[];
      id: number;
    }
  | {
      type: "output";
      outputs: string[];
      id: number;
    }
  | {
      type: "composition";
      nodes: Table<ShaderGraphNode>;
      edges: Table<ShaderGraphEdge>;
      inputs: () => string[];
      outputs: () => string[];
    };

export type ShaderGraphNode = {
  id: number;
  templateId: number;
};

export type ShaderGraphEdge = {
  sourceId: number;
  sourceInput: string;
  targetId: number;
  targetInput: string;
};

export type ShaderGraph = {
  nodeTemplates: Table<NodeTemplate>;
  nodes: Table<ShaderGraphNode>;
  edges: Table<ShaderGraphEdge>;
};

export function assembleComposition(
  templates: Table<NodeTemplate>,
  nodes: Table<ShaderGraphNode>,
  edges: Table<ShaderGraphEdge>
) {
  let outstr = "";
}

export function assembleShader(graph: ShaderGraph) {}
