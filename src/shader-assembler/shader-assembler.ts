import { getFunctions } from "../glsl-analyzer/glsl-ast-utils";
import {
  AssignmentOperator,
  ASTNode,
  Commented,
  CompoundStmt,
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

export type NodeTemplateFunction = {
  src: TranslationUnit;
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

function simpleAssignment(
  left: FullySpecifiedType,
  name: string,
  right: ASTNode<Expr>
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
            variant: dummyNode({
              type: "initialized",
              initializer: right,
            }),
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

export function assembleComposition(params: {
  functions: Table<NodeTemplateFunction>;
  inputs: Table<NodeTemplateInput>;
  outputs: Table<NodeTemplateOutput>;
  compositions: Table<NodeTemplateComposition>;
  templates: Table<NodeTemplate>;
  nodes: Table<ShaderGraphNode>;
  edges: Table<ShaderGraphEdge>;
  fnName: string;
}): Result<string, string> {
  const { functions, fnName, inputs, outputs, nodes, edges, templates } =
    params;

  let outprog: TranslationUnit = {
    data: [],
    comments: [],
  };

  for (const f of functions) {
    outprog.data = outprog.data.concat(f.src.data);
  }

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

  let pendingEdges: ShaderGraphEdge[] = [];

  for (const n of nodes) {
    const template = templates.filter.id(n.templateId).getOne();
    if (template.inputId === undefined) continue;
    const nextEdges = edges.filter.sourceId(n.id).get();
    pendingEdges.push(...nextEdges);
  }

  const incompleteNodes = new Set<ShaderGraphNode>([...nodes]);

  for (const n of incompleteNodes) {
    const template = templates.filter.id(n.templateId).getOne();
    if (template.inputId !== undefined) incompleteNodes.delete(n);
  }

  const completeEdges = new Set<ShaderGraphEdge>();

  const cachedFunctionCallVariables = new Map<number, string>();

  while (pendingEdges.length > 0) {
    const edge = pendingEdges.shift()!;
    completeEdges.add(edge);

    const src = nodes.filter.id(edge.sourceId).getOne();
    const srcTemplate = templates.filter.id(src.templateId).getOne();
    if (srcTemplate.inputId !== undefined) {
      const input = inputs.filter.id(srcTemplate.inputId).getOne();
      statements.push(
        simpleAssignment(
          {
            specifier: input.inputs.find(
              (i) => i.declarator.data.identifier.data === edge.sourceInput
            )!.declarator.data.typeSpecifier,
          },
          `_${edge.id}`,
          identifier(edge.sourceInput)
        )
      );
    } else if (srcTemplate.functionId !== undefined) {
      const fn = functions.filter.id(srcTemplate.functionId).getOne();
      const fnDef = getFunctions(fn.src).find(
        (f) => f.data.prototype.data.name.data === fn.fnName
      )!;
      if (edge.sourceInput === "return value") {
        statements.push(
          simpleAssignment(
            fnDef.data.prototype.data.fullySpecifiedType.data,
            `_${edge.id}`,
            functionCall(
              fn.fnName,
              (fnDef.data.prototype.data.parameters?.data ?? []).map((p) => {
                const varName = edges.filter
                  .targetId(edge.sourceId)
                  .filter.targetInput(
                    lens(p).data.declaratorOrSpecifier.$g<string>((f) =>
                      f.type === "declarator"
                        ? lens(f).declarator.data.identifier.data.$g(id)
                        : ""
                    )
                  )
                  .getOne().id;

                return identifier(`_${varName}`);
              })
            )
          )
        );
      }
    }

    for (const n of incompleteNodes) {
      const incoming = edges.filter.targetId(n.id).get();
      if (incoming.every((n) => completeEdges.has(n))) {
        const outgoing = edges.filter.sourceId(n.id).get();
        pendingEdges.push(...outgoing);
        incompleteNodes.delete(n);
      }
    }
  }

  for (const n of nodes) {
    const template = templates.filter.id(n.templateId).getOne();
    if (template.outputId === undefined) continue;
    const o = outputs.filter.id(template.outputId).getOne();
    for (const o2 of o.outputs) {
      const outputEdge = edges.filter
        .targetId(n.id)
        .filter.targetInput(o2.declarator.data.identifier.data)
        .getOne();

      statements.push(
        exprStatement(
          assignment(
            identifier(o2.declarator.data.identifier.data),
            "=",
            identifier(`_${outputEdge.id}`)
          )
        )
      );
    }
  }

  outprog.data.push(fn);

  return ok(makeFancyFormatter(Infinity).translationUnit(outprog));
}

export function assembleShader(graph: ShaderGraph) {}
