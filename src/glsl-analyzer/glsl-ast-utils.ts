import { delens, id, lens, setDeep } from "../utils/lens";
import { FormatGLSLPacked } from "./formatter/fmt-packed";
import {
  ASTNode,
  Commented,
  Condition,
  Declaration,
  Expr,
  ExternalDeclaration,
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

export function mapOverJson(json: any, map: (json: any) => any) {
  if (json instanceof Array) {
    return json.map((x) => map(x));
  } else if (typeof json === "object") {
    if (json === null) return json;
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [k, map(v)])
    );
  } else {
    return json;
  }
}

export function mapAST<T>(
  t: T,
  map: {
    expr?(
      expr: ASTNode<Expr>,
      mapInner: (expr: ASTNode<Expr>) => ASTNode<Expr>
    ): ASTNode<Expr>;
    stmt?(
      stmt: ASTNode<Stmt>,
      mapInner: (stmt: ASTNode<Stmt>) => ASTNode<Stmt>
    ): ASTNode<Stmt>;
    decl?(
      decl: Commented<Declaration>,
      mapInner: (decl: Commented<Declaration>) => Commented<Declaration>
    ): Commented<Declaration>;
    extDecl?(
      extDecl: ASTNode<ExternalDeclaration>,
      mapInner: (
        extDecl: ASTNode<ExternalDeclaration>
      ) => ASTNode<ExternalDeclaration>
    ): ASTNode<ExternalDeclaration>;
    struct?(
      struct: StructSpecifier,
      mapInner: (struct: StructSpecifier) => StructSpecifier
    ): StructSpecifier;
    error?(
      err: ASTNode<{ _isError: true; why: string }>,
      mapInner: (
        err: ASTNode<{ _isError: true; why: string }>
      ) => ASTNode<{ _isError: true; why: string }>
    ): ASTNode<{ _isError: true; why: string }>;
  }
) {
  const maps: Required<typeof map> = {
    expr: (s, i) => i(s),
    stmt: (s, i) => i(s),
    decl: (s, i) => i(s),
    extDecl: (s, i) => i(s),
    struct: (s, i) => i(s),
    error: (s, i) => i(s),
    ...map,
  };

  const mapper = (child: any): any => {
    if (child?.data?._isError) {
      child = maps.error(child, (x) => mapOverJson(x, mapper));
    }

    if (child?.data?._isExpr) {
      return maps.expr(child, (x) => mapOverJson(x, mapper));
    } else if (child?.data?._isStmt) {
      return maps.stmt(child, (x) => mapOverJson(x, mapper));
    } else if (child?.data?._isDecl) {
      return maps.decl(child, (x) => mapOverJson(x, mapper));
    } else if (child?.data?._isExtDecl) {
      return maps.extDecl(child, (x) => mapOverJson(x, mapper));
    } else if (child?._isStruct) {
      return maps.struct(child, (x) => mapOverJson(x, mapper));
    } else {
      return mapOverJson(child, mapper);
    }
  };
  return mapper(t) as T;
}

export function renameSymbols<T>(t: T, rename: (s: string) => string) {
  function expr(
    e: ASTNode<Expr>,
    mapInner: (expr: ASTNode<Expr>) => ASTNode<Expr>
  ): ASTNode<Expr> {
    if (e.data.type === "field-access") {
      return {
        ...e,
        data: {
          ...e.data,
          left: mapAST(e.data.left, { expr, stmt, decl, extDecl, struct }),
        },
      };
    }

    e = mapInner(e);
    const rewrittenExpr = lens(e).data.$m("type", {
      ident: (e) => e.ident.$(rename),
      "function-call": (e) =>
        e.identifier.$m("type", {
          "function-identifier": (i) => i.identifier.$(rename),
          "type-specifier": (i) =>
            i.specifier.data.typeName.data.$m("type", {
              custom: (s) => s.name.data.$(rename),
              $d: delens,
            }),
        }),
      $d: delens,
    });
    return rewrittenExpr;
  }

  function stmt(
    s: ASTNode<Stmt>,
    mapInner: (stmt: ASTNode<Stmt>) => ASTNode<Stmt>
  ): ASTNode<Stmt> {
    return mapInner(s);
  }

  function decl(
    d: Commented<Declaration>,
    mapInner: (decl: Commented<Declaration>) => Commented<Declaration>
  ): Commented<Declaration> {
    return mapInner(
      lens(d).data.$m("type", {
        struct: (d) => ({
          ...d.$(id),
          name: d.name.$f.data.$(rename),
          name2: d.name.$f.data.$(rename),
        }),

        "declarator-list": (d) =>
          d.declaratorList.data.$p((d) => ({
            declarations: d.declarations.$f.data.$e((i) =>
              i.data.name.data.$(rename)
            ),
          })),

        $d: delens,
      })
    );
  }

  function extDecl(
    d: ASTNode<ExternalDeclaration>,
    mapInner: (
      extDecl: ASTNode<ExternalDeclaration>
    ) => ASTNode<ExternalDeclaration>
  ): ASTNode<ExternalDeclaration> {
    return mapInner(
      lens(d).data.$m("type", {
        function: (d) =>
          d.prototype.data.$p((d) => ({
            name: d.name.$f.data.$(rename),
            parameters: d.parameters.$f.data.$e((i) =>
              i.data.declaratorOrSpecifier.$m("type", {
                declarator: (d) => d.declarator.data.identifier.data.$(rename),
                specifier: delens,
              })
            ),
          })),

        $d: delens,
      })
    );
  }

  function struct(
    d: StructSpecifier,
    mapInner: (d: StructSpecifier) => StructSpecifier
  ): StructSpecifier {
    return mapInner(lens(d).name.data.$(rename));
  }

  return mapAST(t, { expr, stmt, decl, extDecl, struct });
}

export function mapGlobalSymbols(
  t: TranslationUnit,
  rename: (str: string) => string
): TranslationUnit {
  return lens(t).data.$e((e) =>
    e.data.$m("type", {
      function: (e) => e.prototype.data.name.data.$(rename),
      declaration: (e) =>
        e.decl.data.$m("type", {
          struct: (e) =>
            e.$p((s) => ({
              name: s.name.$f.data.$(rename),
              name2: s.name.$f.data.$(rename),
            })),
          "declarator-list": (e) =>
            e.declaratorList.data.declarations.data.$e((d) =>
              d.data.name.data.$(rename)
            ),
          "function-prototype": (e) => e.prototype.data.name.data.$(rename),
          $d: delens,
        }),
      import: delens,
    })
  );
}

export function mapAllSymbolsDefinedByStmt(
  s: ASTNode<Stmt>,
  rename: (str: string) => string
): ASTNode<Stmt> {
  return lens(s).data.$m("type", {
    declaration: (s) =>
      s.decl.data.$m("type", {
        "declarator-list": (d) =>
          d.declaratorList.data.declarations.data.$e((d) =>
            d.data.name.data.$(rename)
          ),
        "function-prototype": (d) => d.prototype.data.name.data.$(rename),
        struct: (d) => ({
          ...d.$(id),
          name: d.name.$f.data.$(rename),
          name2: d.name2.$f.data.$(rename),
        }),
        $d: delens,
      }),
    $d: delens,
  });
}

export function mapAllSymbolsDefinedInsideStmt(
  s: ASTNode<Stmt>,
  rename: (str: string) => string
): ASTNode<Stmt> {
  return lens(s).data.$m("type", {
    compound: (s) =>
      s.statements.$e((s) => mapAllSymbolsDefinedByStmt(s.$(id), rename)),
    for: (s) => s.init.$((s) => mapAllSymbolsDefinedByStmt(s, rename)),
    switch: (s) =>
      s.stmts.$e((s) => mapAllSymbolsDefinedByStmt(s.$(id), rename)),
    $d: delens,
  });
}

export function getAllStatementsInsideStmt(s: ASTNode<Stmt>): ASTNode<Stmt>[] {
  switch (s.data.type) {
    case "break":
      return [];
    case "case":
      return [];
    case "compound":
      return s.data.statements;
    case "continue":
      return [];
    case "declaration":
      return [];
    case "default-case":
      return [];
    case "discard":
      return [];
    case "do-while":
      return [s.data.body];
    case "expr":
      return [];
    case "for":
      return [s.data.init, s.data.body];
    case "return":
      return [];
    case "selection":
      return [
        s.data.rest.data.if,
        ...(s.data.rest.data.else ? [s.data.rest.data.else] : []),
      ];
    case "switch":
      return s.data.stmts;
    case "while":
      return [s.data.body];
    case "error":
      return [];
  }
}

export function mapAllSymbolsDefinedInsideExtDecl(
  ed: ASTNode<ExternalDeclaration>,
  rename: (s: string) => string
) {
  return lens(ed).data.$m("type", {
    function: (e) =>
      e.prototype.data.parameters.data.$e((p) =>
        p.data.declaratorOrSpecifier.$m("type", {
          declarator: (d) => d.declarator.data.identifier.data.$(rename),
          $d: delens,
        })
      ),
    $d: delens,
  });
}

export function mapAllSymbolsDefinedByExtDecl(
  ed: ASTNode<ExternalDeclaration>,
  rename: (s: string) => string
) {
  return lens(ed).data.$m("type", {
    function: (e) => e.prototype.data.name.data.$(rename),
    declaration: (e) =>
      e.decl.data.$m("type", {
        "declarator-list": (d) =>
          d.declaratorList.data.declarations.data.$e((d) =>
            d.data.name.data.$(rename)
          ),
        "function-prototype": (d) => d.prototype.data.name.data.$(rename),
        struct: (d) => ({
          ...d.$(id),
          name: d.name.$f.data.$(rename),
          name2: d.name2.$f.data.$(rename),
        }),
        $d: delens,
      }),
    $d: delens,
  });
}

export function mapAllStatementsInsideExtDecl(
  ed: ASTNode<ExternalDeclaration>,
  map: (s: ASTNode<Stmt>) => ASTNode<Stmt>
): ASTNode<ExternalDeclaration> {
  return lens(ed).data.$m("type", {
    function: (f) => f.body.data.statements.$e((s) => s.$(map)),
    $d: delens,
  });
}

// export function mapAllStatementsInsideStatement(
//   s: ASTNode<Stmt>,
//   map: (s: ASTNode<Stmt>) => ASTNode<Stmt>
// ): ASTNode<Stmt> {
//   return lens(s).data.$m("type", {

//   })
// }
