import { getFunctions } from "../glsl-analyzer/glsl-ast-utils";
import {
  ASTNode,
  ExternalDeclaration,
  TranslationUnit,
} from "../glsl-analyzer/parser";
import { FormatGLSLPacked } from "../glsl-analyzer/fmt-packed";
import { err, ok, Result } from "../utils/result";

export type GLSLFunctionNode = {
  id: number;
  src: TranslationUnit;
  functionName: string;
  incoming: {
    from: number;
    fromParam: string;
    toParam: string;
  }[];
};

export type GLSLInputNode = {
  id: number;
  src: ASTNode<ExternalDeclaration>;
};

export type GLSLOutputNode = {
  id: number;
  src: ASTNode<ExternalDeclaration>;
  from: number;
  fromParam: string;
};

export type GLSLNode = GLSLFunctionNode | GLSLInputNode | GLSLOutputNode;

export function createShaderFromFunctionGraph(
  // functionGraph: Map<number, GLSLNode>
  inputs: GLSLInputNode[],
  outputs: GLSLOutputNode[],
  functions: GLSLFunctionNode[]
): Result<string, string> {
  // const inputs = [...functionGraph.values()].flatMap((v) =>
  //   v.type === "input" ? [v as GLSLInputNode] : []
  // );
  // const outputs = [...functionGraph.values()].flatMap((v) =>
  //   v.type === "output" ? [v as GLSLOutputNode] : []
  // );
  // const functions = [...functionGraph.values()].flatMap((v) =>
  //   v.type === "function" ? [v as GLSLFunctionNode] : []
  // );

  return ok(`#version 300 es
precision highp float;
${inputs.map((i) => FormatGLSLPacked.externalDeclaration(i.src)).join("")}
${outputs.map((i) => FormatGLSLPacked.externalDeclaration(i.src)).join("")}
${functions.map((i) => FormatGLSLPacked.translationUnit(i.src)).join("")}
`);
}
