import {
  ASTNode,
  Commented,
  Condition,
  Declaration,
  Expr,
  ExternalDeclarationFunction,
  FullySpecifiedType,
  ParameterDeclaration,
  Stmt,
  StructSpecifier,
  TranslationUnit,
  TypeSpecifier,
} from "./parser";

export function getFunctions(tu: TranslationUnit) {
  return tu.data.filter(
    (d) => d.data.type === "function"
  ) as Commented<ExternalDeclarationFunction>[];
}

export function getParameters(
  fn: Commented<ExternalDeclarationFunction>
): Commented<Commented<ParameterDeclaration>[]> {
  return fn.data.prototype.data.parameters ?? { data: [], comments: [] };
}

export function getNamedInputParameters(
  fn: Commented<ExternalDeclarationFunction>
) {
  const params = getParameters(fn);

  return params.data.flatMap((p) => {
    if (
      p.data.parameterQualifier?.data !== "out" &&
      p.data.declaratorOrSpecifier.type === "declarator"
    ) {
      return [
        {
          name: p.data.declaratorOrSpecifier.declarator.data.identifier.data,
          param: p,
        },
      ];
    } else {
      return [];
    }
  });
}

export function getNamedOutputParameters(
  fn: Commented<ExternalDeclarationFunction>
) {
  const params = getParameters(fn);

  return params.data.flatMap((p) => {
    if (
      (p.data.parameterQualifier?.data === "out" ||
        p.data.parameterQualifier?.data === "inout") &&
      p.data.declaratorOrSpecifier.type === "declarator"
    ) {
      return [
        {
          name: p.data.declaratorOrSpecifier.declarator.data.identifier.data,
          param: p,
        },
      ];
    } else {
      return [];
    }
  });
}

export function mapExpr(
  node: ASTNode<Expr>,
  map: (expr: ASTNode<Expr>) => ASTNode<Expr>
): ASTNode<Expr> {
  const data = node.data;
  const n = (e: Expr): ASTNode<Expr> => ({ ...node, data: e });
  switch (data.type) {
    case "assignment":
      return n({
        ...data,
        left: map(data.left),
        right: map(data.right),
      });
    case "binary-op":
      return n({
        ...data,
        left: map(data.left),
        right: map(data.right),
      });
    case "bool":
      return node;
    case "conditional":
      return n({
        ...data,
        condition: map(data.condition),
        ifTrue: map(data.ifTrue),
        ifFalse: map(data.ifFalse),
      });
    case "error":
      return node;
    case "field-access":
      return n({
        ...data,
        left: map(data.left),
        right: map(data.right),
      });
    case "float":
      return node;
    case "function-call":
      let fnIdent = data.identifier;
      if (
        fnIdent.type === "type-specifier" &&
        fnIdent.specifier.data.arrayType.type === "static"
      ) {
        fnIdent = {
          ...fnIdent,
          specifier: {
            ...fnIdent.specifier,
            data: {
              ...fnIdent.specifier.data,
              arrayType: {
                ...fnIdent.specifier.data.arrayType,
                size: map(fnIdent.specifier.data.arrayType.size),
              },
            },
          },
        };
      }
      return n({
        ...data,
        args: data.args.map((a) => map(a)),
        identifier: fnIdent,
      });
    case "function-call-field-access":
      return n({
        ...data,
        left: map(data.left),
        right: map(data.right),
      });
    case "ident":
      return node;
    case "int":
      return node;
    case "unary-op":
      return n({
        ...data,
        left: map(data.left),
      });
  }
}

export function mapStmt(
  node: ASTNode<Stmt>,
  map: (stmt: ASTNode<Stmt>) => ASTNode<Stmt>
): ASTNode<Stmt> {
  const data = node.data;
  const n = (s: Stmt): ASTNode<Stmt> => ({ ...node, data: s });
  switch (data.type) {
    case "break":
      return node;
    case "case":
      return node;
    case "compound":
      return n({
        ...data,
        statements: data.statements.map((s) => map(s)),
      });
    case "continue":
      return node;
    case "declaration":
      return node;
    case "default-case":
      return node;
    case "discard":
      return node;
    case "do-while":
      return n({
        ...data,
        body: map(data.body),
      });
    case "expr":
      return node;
    case "for":
      return n({
        ...data,
        init: map(data.init),
        body: map(data.body),
      });
    case "return":
      return node;
    case "selection":
      return n({
        ...data,
        rest: {
          ...data.rest,
          data: {
            if: map(data.rest.data.if),
            else: data.rest.data.else ? map(data.rest.data.else) : undefined,
          },
        },
      });
    case "switch":
      return n({
        ...data,
        stmts: data.stmts.map((s) => map(s)),
      });
    case "while":
      return n({
        ...data,
        body: map(data.body),
      });
  }
}

export function mapExprInStructSpecifier(
  ss: StructSpecifier,
  map: (expr: ASTNode<Expr>) => ASTNode<Expr>
): StructSpecifier {
  const members = ss.members.data.map((m) => {});
}

export function mapExprInTypeSpecifier(
  specifier: TypeSpecifier,
  map: (expr: ASTNode<Expr>) => ASTNode<Expr>
): TypeSpecifier {
  return {
    ...specifier,
    specifier: {
      ...specifier.specifier,
      data: {
        ...specifier.specifier.data,
        arrayType:
          specifier.specifier.data.arrayType.type === "static"
            ? {
                ...specifier.specifier.data.arrayType,
                size: map(specifier.specifier.data.arrayType.size),
              }
            : specifier.specifier.data.arrayType,
      },
    },
  };
}

export function mapExprInFullySpecifiedType(
  fst: FullySpecifiedType,
  map: (expr: ASTNode<Expr>) => ASTNode<Expr>
): FullySpecifiedType {
  let specifier = mapExprInTypeSpecifier(fst.specifier.data, map);

  return {
    ...fst,
    specifier: {
      ...fst.specifier,
      data: specifier,
    },
  };
}

export function mapExprInDecl(
  decl: Declaration,
  map: (expr: ASTNode<Expr>) => ASTNode<Expr>
): Declaration {
  switch (decl.type) {
    case "declarator-list":

    // return {...decl,
    //   declarationList:
    // }
  }
}

export function mapExprInCond(
  cond: Condition,
  map: (expr: ASTNode<Expr>) => ASTNode<Expr>
) {
  if (cond.type === "expr") {
    return {
      ...cond,
      expr: map(cond.expr),
    };
  }
  return {
    ...cond,
    initializer: map(cond.initializer),
  };
}

export function mapExprInStmt(
  stmt: ASTNode<Stmt>,
  map: (expr: ASTNode<Expr>) => ASTNode<Expr>
) {
  const stmtMapper = (oldStmt: ASTNode<Stmt>): ASTNode<Stmt> => {
    const s = mapStmt(oldStmt, stmtMapper);
    const n = (sd: Stmt): ASTNode<Stmt> => ({ ...s, data: sd });
    switch (s.data.type) {
      case "case":
        return n({
          ...s.data,
          expr: mapExpr(s.data.expr, map),
        });
      case "expr":
        return n({
          ...s.data,
          expr: s.data.expr ? mapExpr(s.data.expr, map) : undefined,
        });
      case "return":
        return n({
          ...s.data,
          expr: s.data.expr ? mapExpr(s.data.expr, map) : undefined,
        });
      case "selection":
        return n({
          ...s.data,
          cond: mapExpr(s.data.cond, map),
        });
      case "do-while":
        return n({
          ...s.data,
          cond: mapExpr(s.data.cond, map),
        });
      case "while":
        return n({
          ...s.data,
          cond: {
            ...s.data.cond,
            data: mapExprInCond(s.data.cond.data, map),
          },
        });
      case "for":
        return n({
          ...s.data,
          rest: {
            ...s.data.rest,
            data: {
              condition: s.data.rest.data.condition
                ? {
                    ...s.data.rest.data.condition,
                    data: mapExprInCond(s.data.rest.data.condition.data, map),
                  }
                : undefined,
              expr: s.data.rest.data.expr
                ? map(s.data.rest.data.expr)
                : undefined,
            },
          },
        });
      case "switch":
        return n({
          ...s.data,
          expr: map(s.data.expr),
        });
      default:
        return s;
    }
  };

  return mapStmt(stmt, stmtMapper);
}

export function replaceSymbolInExpr(
  node: ASTNode<Expr>,
  oldSymbol: string,
  newSymbol: string
): ASTNode<Expr> {
  const replace = (n: ASTNode<Expr>): ASTNode<Expr> => {
    const newNode = mapExpr(n, replace);

    if (newNode.data.type === "ident") {
      if (newNode.data.ident === oldSymbol)
        return {
          ...newNode,
          data: {
            ...newNode.data,
            ident: newSymbol,
          },
        };
    }

    return newNode;
  };

  return replace(node);
}
