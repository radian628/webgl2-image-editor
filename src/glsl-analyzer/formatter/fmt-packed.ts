import {
  ASTNode,
  Commented,
  CompoundStmt,
  Condition,
  Declaration,
  Expr,
  ExternalDeclaration,
  ForRestStatement,
  FullySpecifiedType,
  FunctionHeader,
  FunctionIdentifier,
  InitDeclaratorList,
  InterpolationQualifier,
  InvariantQualifier,
  LayoutQualifier,
  LayoutQualifierId,
  ParameterDeclaration,
  ParameterDeclarator,
  ParameterQualifier,
  ParameterTypeQualifier,
  Precision,
  SelectionRestStmt,
  SingleDeclaration,
  SingleDeclarationStart,
  Stmt,
  StorageQualifier,
  StructDeclaration,
  StructDeclarationList,
  StructDeclarator,
  StructDeclaratorList,
  StructSpecifier,
  TranslationUnit,
  TypeNoPrec,
  TypeQualifier,
  TypeSpecifier,
  TypeSpecifierNonarray,
} from "../parser";
import {
  binaryPrecedences,
  maxPrecedence,
  minPrecedence,
  unaryPrecedences,
} from "./fmt-shared";

export namespace FormatGLSLPacked {
  export type ExprCtx = {
    precedence: number;
  };

  export function exprmax(e: ASTNode<Expr>): string {
    return expr(e, { precedence: maxPrecedence });
  }

  export function expr(e: ASTNode<Expr>, c: ExprCtx): string {
    switch (e.data.type) {
      case "bool":
        return e.data.bool ? "true" : "false";
      case "int":
        return e.data.asString;
      case "float":
        return e.data.asString;
      case "ident":
        return e.data.ident;
      case "conditional":
        const p = { precedence: maxPrecedence };
        return `${expr(e.data.condition, p)}?${expr(e.data.ifTrue, p)}:${expr(
          e.data.ifFalse,
          p
        )}`;
      case "binary-op": {
        const prec = c.precedence;
        const c2 = {
          precedence: binaryPrecedences[e.data.op],
        };
        if (e.data.op == "[]") {
          const left = expr(e.data.left, c2);
          const right = expr(e.data.right, { precedence: maxPrecedence });
          return `${prec < c2.precedence ? `(${left})` : left}[${right}]`;
        }

        const baseExpr = `${expr(e.data.left, c2)}${e.data.op}${expr(
          e.data.right,
          { precedence: c2.precedence - 1 }
        )}`;
        return prec < c2.precedence ? `(${baseExpr})` : baseExpr;
      }
      case "field-access":
        return `${expr(e.data.left, {
          precedence: minPrecedence,
        })}.${e.data.right.type === "variable" ? e.data.right.variable.data : exprmax(e.data.right.function)}`;
      case "unary-op": {
        const prec = c.precedence;
        const c2 = {
          precedence: unaryPrecedences[e.data.op],
        };
        const operand = expr(e.data.left, c2);
        const baseExpr = e.data.isAfter
          ? `${operand}${e.data.op}`
          : `${e.data.op}${operand}`;
        return prec < c2.precedence ? `(${baseExpr})` : baseExpr;
      }
      case "assignment":
        return `${expr(e.data.left, {
          precedence: maxPrecedence,
        })}${e.data.op}${expr(e.data.right, { precedence: maxPrecedence })}`;
      case "function-call":
        return `${functionCallIdentifier(e.data.identifier)}(${
          e.data.isVoid
            ? "void"
            : e.data.args
                .map((arg) => expr(arg, { precedence: maxPrecedence }))
                .join(",")
        })`;
      case "error":
        return "###ERROR###";
    }
  }

  export function functionCallIdentifier(i: FunctionIdentifier): string {
    if (i.type === "function-identifier") return i.identifier;

    return typeSpecifierNoCommented(i);
  }

  export function translationUnit(tr: TranslationUnit): string {
    return tr.data.map((decl) => externalDeclaration(decl)).join("");
  }

  export function externalDeclaration(
    ed: ASTNode<ExternalDeclaration>
  ): string {
    if (ed.data.type === "function") {
      return functionPrototype(ed.data.prototype) + statement(ed.data.body);
    }

    if (ed.data.type === "import") {
      const from = `from"${ed.data.from}";`;
      if (ed.data.imports.data.type === "all") {
        if (ed.data.imports.data.prefix) {
          return `import*as ${ed.data.imports.data.prefix} ${from}`;
        }
        return `import*${from}`;
      }
      return `import{${ed.data.imports.data.imports
        .map((i) => {
          if (i.data.alias) {
            return `${i.data.name} as ${i.data.alias}`;
          }
          return i.data.name;
        })
        .join(",")}}${from}`;
    }

    return declaration(ed.data.decl);
  }

  export function functionPrototype(fp: Commented<FunctionHeader>): string {
    return (
      fullySpecifiedType(fp.data.fullySpecifiedType) +
      " " +
      fp.data.name.data +
      "(" +
      (fp.data.parameters?.data
        .map((param) => parameterDeclaration(param))
        .join(",") ?? "") +
      ")"
    );
  }

  export function fullySpecifiedType(
    fst: Commented<FullySpecifiedType>
  ): string {
    return (
      (fst.data.qualifier ? typeQualifier(fst.data.qualifier) + " " : "") +
      typeSpecifier(fst.data.specifier)
    );
  }

  export function typeQualifier(tq: Commented<TypeQualifier>): string {
    switch (tq.data.type) {
      case "sq":
        return storageQualifier(tq.data.storageQualifier);
      case "intq-sq":
        return [
          [interpolationQualifier(tq.data.interpolationQualifier)],
          tq.data.storageQualifier
            ? [storageQualifier(tq.data.storageQualifier)]
            : [],
        ]
          .flat(1)
          .join(" ");
      case "lq-sq":
        return [
          [layoutQualifier(tq.data.layoutQualifier)],
          tq.data.storageQualifier
            ? [storageQualifier(tq.data.storageQualifier)]
            : [],
        ]
          .flat(1)
          .join(" ");
      case "invq-intq-sq":
        return [
          invariantQualifier(tq.data.invariantQualifier),
          tq.data.interpolationQualifier
            ? [interpolationQualifier(tq.data.interpolationQualifier)]
            : [],
          storageQualifier(tq.data.storageQualifier),
        ]
          .flat(1)
          .join(" ");
    }
  }

  export function invariantQualifier(
    iq: Commented<InvariantQualifier>
  ): string {
    return iq.data;
  }

  export function layoutQualifier(lq: Commented<LayoutQualifier>): string {
    return `layout(${lq.data.map((d) => layoutQualifierId(d)).join(" ")})`;
  }

  export function layoutQualifierId(
    lqid: Commented<LayoutQualifierId>
  ): string {
    if (lqid.data.value !== undefined) {
      return `${lqid.data.identifier}=${lqid.data.value}`;
    }
    return lqid.data.identifier;
  }

  export function storageQualifier(sq: Commented<StorageQualifier>): string {
    return sq.data;
  }

  export function interpolationQualifier(
    iq: Commented<InterpolationQualifier>
  ): string {
    return iq.data;
  }

  export function typeSpecifier(ts: Commented<TypeSpecifier>): string {
    return typeSpecifierNoCommented(ts.data);
  }

  export function typeSpecifierNoCommented(ts: TypeSpecifier) {
    return `${ts.precision ? precision(ts.precision) + " " : ""}${typeNoPrec(
      ts.specifier
    )}`;
  }

  export function precision(p: Commented<Precision>): string {
    return p.data;
  }

  export function typeNoPrec(tnp: Commented<TypeNoPrec>): string {
    switch (tnp.data.arrayType.type) {
      case "none":
        return typeSpecifierNonarray(tnp.data.typeName);
      case "static":
        return `${typeSpecifierNonarray(tnp.data.typeName)}[${exprmax(
          tnp.data.arrayType.size
        )}]`;
      case "dynamic":
        return `${typeSpecifierNonarray(tnp.data.typeName)}[]`;
    }
  }

  export function typeSpecifierNonarray(
    tsn: Commented<TypeSpecifierNonarray>
  ): string {
    switch (tsn.data.type) {
      case "builtin":
      case "custom":
        return tsn.data.name.data;
      case "struct":
        return structSpecifier(tsn.data.struct);
    }
  }

  export function structSpecifier(ss: Commented<StructSpecifier>): string {
    return `struct ${
      ss.data.name ? ss.data.name.data : ""
    }{${structDeclarationList(ss.data.members)}}`;
  }

  export function parameterDeclaration(
    pd: Commented<ParameterDeclaration>
  ): string {
    return `${
      pd.data.parameterTypeQualifier
        ? parameterTypeQualifier(pd.data.parameterTypeQualifier) + " "
        : ""
    }${
      pd.data.parameterQualifier
        ? parameterQualifier(pd.data.parameterQualifier) + " "
        : ""
    }${
      pd.data.declaratorOrSpecifier.type === "declarator"
        ? parameterDeclarator(pd.data.declaratorOrSpecifier.declarator)
        : typeSpecifier(pd.data.declaratorOrSpecifier.specifier)
    }`;
  }

  export function parameterDeclarator(
    pd: Commented<ParameterDeclarator>
  ): string {
    return (
      `${typeSpecifier(pd.data.typeSpecifier)} ${pd.data.identifier.data}` +
      (pd.data.arraySize ? `[${exprmax(pd.data.arraySize)}]` : "")
    );
  }

  export function parameterTypeQualifier(
    ptq: Commented<ParameterTypeQualifier>
  ) {
    return "const";
  }

  export function parameterQualifier(
    pq: Commented<ParameterQualifier>
  ): string {
    return pq.data;
  }

  export function initDeclaratorList(
    idl: Commented<InitDeclaratorList>
  ): string {
    const start = singleDeclarationStart(idl.data.init);

    const hasSpace = !start.endsWith("}");

    return `${start}${hasSpace ? " " : ""}${idl.data.declarations.data
      .map((d) => singleDeclaration(d))
      .join(",")}`;
  }

  export function singleDeclarationStart(
    sds: Commented<SingleDeclarationStart>
  ): string {
    switch (sds.data.type) {
      case "type":
        return fullySpecifiedType(sds.data.declType);
      case "invariant":
        return "invariant";
    }
  }

  export function singleDeclaration(sd: Commented<SingleDeclaration>): string {
    if (!sd.data.variant) {
      return sd.data.name.data;
    }
    switch (sd.data.variant.data.type) {
      case "initialized":
        return `${sd.data.name.data}=${exprmax(
          sd.data.variant.data.initializer
        )}`;
      case "initialized-array":
        return `${sd.data.name.data}[${
          sd.data.variant.data.size ? exprmax(sd.data.variant.data.size) : ""
        }]=${exprmax(sd.data.variant.data.initializer)}`;
      case "sized-array":
        return `${sd.data.name.data}[${exprmax(sd.data.variant.data.size)}]`;
    }
  }

  export function declaration(d: Commented<Declaration>): string {
    switch (d.data.type) {
      case "function-prototype":
        return `${functionPrototype(d.data.prototype)};`;
      case "declarator-list":
        return initDeclaratorList(d.data.declaratorList) + ";";
      case "type-specifier":
        return `precision ${precision(d.data.precision)} ${typeNoPrec(
          d.data.specifier
        )};`;
      case "type-qualifier":
        return `${typeQualifier(d.data.typeQualifier)};`;
      case "struct":
        return `${typeQualifier(d.data.typeQualifier)} ${
          d.data.name
        }{${structDeclarationList(d.data.declarationList)}}${
          d.data.name2 ?? ""
        }${d.data.constantExpr ? `[${exprmax(d.data.constantExpr)}]` : ""};`;
    }
  }

  export function structDeclarationList(
    sdl: Commented<StructDeclarationList>
  ): string {
    return sdl.data.map((s) => structDeclaration(s)).join("");
  }

  export function structDeclaration(sd: Commented<StructDeclaration>): string {
    return `${
      sd.data.typeQualifier ? typeQualifier(sd.data.typeQualifier) + " " : ""
    }${typeSpecifier(sd.data.typeSpecifier)} ${structDeclaratorList(
      sd.data.declaratorList
    )};`;
  }

  export function structDeclaratorList(
    sdl: Commented<StructDeclaratorList>
  ): string {
    return sdl.data.map((s) => structDeclarator(s)).join(",");
  }

  export function structDeclarator(sd: Commented<StructDeclarator>) {
    return (
      `${sd.data.name}` +
      (sd.data.isArray
        ? `[${sd.data.isArray.expr ? exprmax(sd.data.isArray.expr) : ""}]`
        : "")
    );
  }

  export function statement(s: ASTNode<Stmt>): string {
    switch (s.data.type) {
      case "expr":
        return `${s.data.expr ? exprmax(s.data.expr) : ""};`;
      case "break":
        return "break;";
      case "case":
        return `case ${exprmax(s.data.expr)}:`;
      case "continue":
        return "continue;";
      case "discard":
        return "discard;";
      case "declaration":
        return declaration(s.data.decl);
      case "switch":
        return `switch(${exprmax(s.data.expr)}){${s.data.stmts
          .map((s) => statement(s))
          .join("")}}`;
      case "default-case":
        return "default:";
      case "return":
        return `return${s.data.expr ? " " + exprmax(s.data.expr) : ""};`;
      case "selection":
        return `if(${exprmax(s.data.cond)})${selectionRestStmt(s.data.rest)}`;
      case "while":
        return `while(${condition(s.data.cond)})${statement(s.data.body)}`;
      case "do-while":
        return `do ${statement(s.data.body)}while(${exprmax(s.data.cond)});`;
      case "compound":
        return `{${s.data.statements.map(statement).join("")}}`;
      case "for":
        return `for(${statement(s.data.init)}${forRestStatement(
          s.data.rest
        )})${statement(s.data.body)}`;
    }
  }

  export function forRestStatement(frs: Commented<ForRestStatement>): string {
    return `${frs.data.condition ? condition(frs.data.condition) : ""};${
      frs.data.expr ? exprmax(frs.data.expr) : ""
    }`;
  }

  export function selectionRestStmt(srs: Commented<SelectionRestStmt>): string {
    return `${statement(srs.data.if)}${
      srs.data.else ? `else ${statement(srs.data.else)}` : ""
    }`;
  }

  export function condition(c: Commented<Condition>) {
    if (c.data.type === "expr") {
      return exprmax(c.data.expr);
    }

    return `${fullySpecifiedType(c.data.fullySpecifiedType)}=${exprmax(
      c.data.initializer
    )}`;
  }
}
