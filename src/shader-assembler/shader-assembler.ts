import { getFunctions, renameSymbols } from "../glsl-analyzer/glsl-ast-utils";
import {
  AssignmentOperator,
  ASTNode,
  Commented,
  CompoundStmt,
  declaration,
  Declaration,
  dummyNode,
  Expr,
  ExternalDeclaration,
  ExternalDeclarationFunction,
  FullySpecifiedType,
  InitDeclaratorList,
  ParameterDeclaration,
  ParameterDeclarator,
  SingleDeclaration,
  SingleDeclarationStart,
  SingleDeclarationVariant,
  Stmt,
  TranslationUnit,
  TypeNoPrec,
  TypeSpecifier,
} from "../glsl-analyzer/parser";
import { FormatGLSLPacked } from "../glsl-analyzer/formatter/fmt-packed";
import { err, ok, Result } from "../utils/result";
import { Table } from "../utils/table";
import { makeFancyFormatter } from "../glsl-analyzer/formatter/fmt-fancy";
import { id, lens } from "../utils/lens";
import {
  bundleShaders,
  BundleShadersReturnType,
  ResolvedPath,
} from "../glsl-analyzer/shader-bundler/shader-bundler";

export type GLSLSource = {
  id: number;
  name: string;
  src: TranslationUnit;
};

export type NodeTemplateFunction = {
  srcId: number;
  fnName: string;
  id: number;
};

export type NodeTemplateInput = {
  inputs: {
    const?: boolean;
    declarator: Commented<ParameterDeclarator>;
  }[];

  id: number;
};

export type NodeTemplateOutput = {
  outputs: {
    const?: boolean;
    declarator: Commented<ParameterDeclarator>;
  }[];

  id: number;
};

export type NodeTemplateComposition = {
  nodes: Table<ShaderGraphNode>;
  edges: Table<ShaderGraphEdge>;
  inputs: () => string[];
  outputs: () => string[];
};

export type NodeTemplate = {
  functionId?: number;
  inputId?: number;
  outputId?: number;
  compositionId?: number;
  id: number;
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
  id: number;
};

export type ShaderGraph = {
  nodeTemplates: Table<NodeTemplate>;
  nodes: Table<ShaderGraphNode>;
  edges: Table<ShaderGraphEdge>;
};

function builtinType(name: string) {
  return dummyNode<FullySpecifiedType>({
    specifier: dummyNode<TypeSpecifier>({
      type: "type-specifier",
      specifier: dummyNode({
        typeName: dummyNode({
          type: "builtin",
          name: dummyNode("void"),
        }),
        arrayType: { type: "none" },
      }),
    }),
  });
}

function functionCall(name: string, args: ASTNode<Expr>[]) {
  return dummyNode<Expr>({
    type: "function-call",
    identifier: {
      type: "function-identifier",
      identifier: name,
    },
    args,
    isVoid: false,
    _isExpr: true,
  });
}

function identifier(name: string): ASTNode<Expr> {
  return dummyNode({
    type: "ident",
    ident: name,
    _isExpr: true,
  });
}

function variableDefinition(
  left: FullySpecifiedType,
  name: string,
  right?: ASTNode<Expr>
): ASTNode<Stmt> {
  return dummyNode<Stmt>({
    type: "declaration",
    decl: dummyNode<Declaration>({
      type: "declarator-list",
      _isDecl: true,
      declaratorList: dummyNode<InitDeclaratorList>({
        init: dummyNode<SingleDeclarationStart>({
          type: "type",
          declType: dummyNode(left),
        }),
        declarations: dummyNode<Commented<SingleDeclaration>[]>([
          dummyNode<SingleDeclaration>({
            name: dummyNode(name),
            variant: right
              ? dummyNode({
                  type: "initialized",
                  initializer: right,
                })
              : undefined,
          }),
        ]),
      }),
    }),
    _isStmt: true,
  });
}

function exprStatement(expr?: ASTNode<Expr>): ASTNode<Stmt> {
  return dummyNode<Stmt>({
    type: "expr",
    expr,
    _isStmt: true,
  });
}

function assignment(
  left: ASTNode<Expr>,
  assignmentOp: AssignmentOperator,
  right: ASTNode<Expr>
): ASTNode<Expr> {
  return dummyNode<Expr>({
    type: "assignment",
    _isExpr: true,
    left,
    right,
    op: assignmentOp,
  });
}

function rename<T>(ast: T, extantSymbols: Set<string>): T {
  const newSymbols = new Set<string>();

  function renameSymbol(t: string, num?: number) {
    const s = num === undefined ? t : `${t}_${num}`;
    if (extantSymbols.has(s)) {
      return renameSymbol(t, (num ?? -1) + 1);
    }
    newSymbols.add(t);
    return s;
  }

  const result = renameSymbols(ast, (s) => renameSymbol(s));
  for (const s of newSymbols) extantSymbols.add(s);
  return result;
}

function toposort(
  nodes: Table<ShaderGraphNode>,
  edges: Table<ShaderGraphEdge>
): ShaderGraphNode[] {
  const out: ShaderGraphNode[] = [];
  const remainingNodes = nodes
    .get()
    .filter((n) => edges.filter.targetId(n.id).get().length === 0);

  const markedEdges = new Set<ShaderGraphEdge>();

  while (remainingNodes.length > 0) {
    const n = remainingNodes.shift()!;
    out.push(n);

    const edgesFromN = edges.filter.sourceId(n.id).get();
    const nodesFromN = [
      ...new Set(edgesFromN.flatMap((e) => nodes.filter.id(e.targetId).get())),
    ];

    for (const m of nodesFromN) {
      const edgesFromNToM = edges.filter
        .sourceId(n.id)
        .filter.targetId(m.id)
        .get();
      for (const edge of edgesFromNToM) {
        markedEdges.add(edge);
      }
      const edgesToM = edges.filter.targetId(m.id).get();
      if (edgesToM.every((e) => markedEdges.has(e))) {
        remainingNodes.push(m);
      }
    }
  }

  return [...out];
}

export function assembleComposition(params: {
  sources: Table<GLSLSource>;
  functions: Table<NodeTemplateFunction>;
  inputs: Table<NodeTemplateInput>;
  outputs: Table<NodeTemplateOutput>;
  compositions: Table<NodeTemplateComposition>;
  templates: Table<NodeTemplate>;
  nodes: Table<ShaderGraphNode>;
  edges: Table<ShaderGraphEdge>;
  fnName: string;
  globalSymbolRemappings?: Map<string, string>;
}): Result<TranslationUnit, string> {
  const {
    functions,
    fnName,
    inputs,
    outputs,
    nodes,
    edges,
    templates,
    sources,
  } = params;

  const globalSymbolRemappings = new Map<string, string>();

  let outprog: TranslationUnit = {
    data: [],
    comments: [],
  };

  const inputParams: Commented<ParameterDeclaration>[] = [...inputs]
    .flatMap((i) => i.inputs)
    .map((i) =>
      dummyNode({
        parameterTypeQualifier: i.const ? dummyNode("const") : undefined,
        parameterQualifier: dummyNode("in"),
        declaratorOrSpecifier: {
          type: "declarator",
          declarator: i.declarator,
        },
      })
    );
  const outputParams: Commented<ParameterDeclaration>[] = [...outputs]
    .flatMap((i) => i.outputs)
    .map((i) =>
      dummyNode({
        parameterTypeQualifier: i.const ? dummyNode("const") : undefined,
        parameterQualifier: dummyNode("out"),
        declaratorOrSpecifier: {
          type: "declarator",
          declarator: i.declarator,
        },
      })
    );

  const fn: ASTNode<ExternalDeclarationFunction> =
    dummyNode<ExternalDeclarationFunction>({
      type: "function",
      prototype: dummyNode({
        name: dummyNode(fnName),
        fullySpecifiedType: builtinType("void"),
        parameters: dummyNode([...inputParams, ...outputParams]),
      }),
      body: dummyNode<CompoundStmt>({
        type: "compound",
        statements: [],
        _isStmt: true,
      }),
      _isExtDecl: true,
    });

  const statements = fn.data.body.data.statements;

  const sortedNodes = toposort(nodes, edges);

  for (const n of sortedNodes) {
    const template = templates.filter.id(n.templateId).getOne();
    if (template.inputId !== undefined) {
      const inputTemplate = inputs.filter.id(template.inputId).getOne();
      for (const i of inputTemplate.inputs) {
        statements.push(
          variableDefinition(
            {
              specifier: i.declarator.data.typeSpecifier,
            },
            `_${n.id}_${i.declarator.data.identifier.data}`,
            identifier(i.declarator.data.identifier.data)
          )
        );
      }
    } else if (template.functionId !== undefined) {
      const functionTemplate = functions.filter
        .id(template.functionId)
        .getOne();
      const src = sources.filter.id(functionTemplate.srcId).getOne();
      const fn = getFunctions(src.src).find(
        (fn) => fn.data.prototype.data.name.data === functionTemplate.fnName
      )!;

      const inputEdges = edges.filter
        .targetId(n.id)
        .get()
        .map((edge) => {
          return { edge, node: nodes.filter.id(edge.sourceId).getOne() };
        });

      const args = (fn.data.prototype.data.parameters?.data ?? []).map((p) => {
        if (p.data.declaratorOrSpecifier.type === "specifier")
          throw new Error();
        else {
          const declarator = p.data.declaratorOrSpecifier.declarator;
          if (p.data.parameterQualifier?.data === "out") {
            const name = `_${n.id}_${declarator.data.identifier.data}`;
            statements.push(
              variableDefinition(
                { specifier: declarator.data.typeSpecifier },
                name
              )
            );
            return identifier(name);
          } else {
            const { node, edge } = inputEdges.find(
              (e) => e.edge.targetInput === declarator.data.identifier.data
            )!;
            return identifier(
              `_${node.id}_${
                edge.sourceInput === "return value"
                  ? "retval"
                  : edge.sourceInput
              }`
            );
          }
        }
      });

      const importPrefix = `__${functionTemplate.srcId.toString()}_`;

      outprog.data.push(
        dummyNode({
          type: "import",
          from: functionTemplate.srcId.toString(),
          imports: dummyNode({
            type: "all",
            prefix: importPrefix,
          }),
        })
      );

      const fncall = functionCall(importPrefix + functionTemplate.fnName, args);

      const typeName =
        fn.data.prototype.data.fullySpecifiedType.data.specifier.data.specifier
          .data.typeName.data;

      if (typeName.type === "builtin" && typeName.name.data === "void") {
        statements.push(exprStatement(fncall));
      } else {
        statements.push(
          variableDefinition(
            fn.data.prototype.data.fullySpecifiedType.data,
            `_${n.id}_retval`,
            fncall
          )
        );
      }
    } else if (template.outputId !== undefined) {
      const outputTemplate = outputs.filter.id(template.outputId).getOne();

      for (const o of outputTemplate.outputs) {
        const edge = edges.filter
          .targetId(n.id)
          .filter.targetInput(o.declarator.data.identifier.data)
          .getOne();
        const srcNode = nodes.filter.id(edge.sourceId).getOne();

        statements.push(
          exprStatement(
            assignment(
              identifier(o.declarator.data.identifier.data),
              "=",
              identifier(
                `_${srcNode.id}_${
                  edge.sourceInput === "return value"
                    ? "retval"
                    : edge.sourceInput
                }`
              )
            )
          )
        );
      }
    }
  }

  outprog.data.push(fn);

  // return ok(makeFancyFormatter(Infinity).translationUnit(outprog));

  return ok(outprog);
}

export async function assembleAndBundleComposition(
  ...[params]: Parameters<typeof assembleComposition>
): Promise<Result<BundleShadersReturnType, string>> {
  const result = assembleComposition(params).mapS(async (t) => {
    const sources = params.sources.get();

    const sourceMap = new Map(sources.map((s) => [s.id.toString(), s.src]));

    return await bundleShaders({
      entryPoint: "composition",
      resolvePath(path): Promise<ResolvedPath> {
        if (path == "composition") {
          return Promise.resolve(
            ok({
              type: "ast",
              unit: t,
            })
          );
        } else {
          const unit = sourceMap.get(path);
          if (!unit) {
            return Promise.resolve(err(`Not found.`));
          }
          return Promise.resolve(ok({ type: "ast", unit }));
        }
      },
      mainFunctionName: params.fnName,
    });
  });

  if (result.data.success) {
    return await result.data.data;
  }
  return err("Failed to compile.");
}

export async function assembleAndBundleAndStringifyComposition(
  ...[params]: Parameters<typeof assembleComposition>
): Promise<Result<string, string>> {
  return (await assembleAndBundleComposition(params)).mapS((e) => {
    return makeFancyFormatter(Infinity, 2).translationUnit(e.code);
  });
}

export function assembleShader(graph: ShaderGraph) {}
