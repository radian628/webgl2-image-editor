import { id, lens, setDeep } from "../utils/lens";
import { FormatGLSLPacked } from "./fmt-packed";
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
  maps: {
    expr(
      expr: ASTNode<Expr>,
      mapInner: (expr: ASTNode<Expr>) => ASTNode<Expr>
    ): ASTNode<Expr>;
    stmt(
      stmt: ASTNode<Stmt>,
      mapInner: (stmt: ASTNode<Stmt>) => ASTNode<Stmt>
    ): ASTNode<Stmt>;
    decl(
      decl: Commented<Declaration>,
      mapInner: (decl: Commented<Declaration>) => Commented<Declaration>
    ): Commented<Declaration>;
    extDecl(
      extDecl: ASTNode<ExternalDeclaration>,
      mapInner: (
        extDecl: ASTNode<ExternalDeclaration>
      ) => ASTNode<ExternalDeclaration>
    ): ASTNode<ExternalDeclaration>;
    struct(
      struct: StructSpecifier,
      mapInner: (struct: StructSpecifier) => StructSpecifier
    ): StructSpecifier;
  }
) {
  const mapper = (child: any): any => {
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
  ) {
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
    return lens(e).data.$m("type", {
      ident: (e) => lens(e).ident.$(rename),
      "function-call": (e) =>
        lens(e).identifier.$m("type", {
          "function-identifier": (i) => lens(i).identifier.$(rename),
          "type-specifier": (i) =>
            lens(i).specifier.data.typeName.data.$m("type", {
              custom: (s) => lens(s).name.data.$(rename),
              $d: id,
            }),
        }),
      $d: id,
    });
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
          ...d,
          name: lens(d).name.$f.data.$(rename),
          name2: lens(d).name.$f.data.$(rename),
        }),

        "declarator-list": (d) =>
          lens(d).declaratorList.data.$p((d) => ({
            declarations: lens(d).declarations.$f.data.$e((i) =>
              lens(i).data.name.data.$(rename)
            ),
          })),

        $d: id,
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
          lens(d).prototype.data.$p((d) => ({
            name: lens(d).name.$f.data.$(rename),
            parameters: lens(d).parameters.$f.data.$e((i) =>
              lens(i).data.declaratorOrSpecifier.$m("type", {
                declarator: (d) =>
                  lens(d).declarator.data.identifier.data.$(rename),
                specifier: id,
              })
            ),
          })),

        $d: id,
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
