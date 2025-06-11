import {
  ASTNode,
  Commented,
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

export type ExprCtx = {
  precedence: number;
};

export type NodeCtx = {
  indent: number;
};

export const defaultNodeCtx = {
  indent: 0,
};

export const makeFancyFormatter = (
  lineLengthLimit: number = Infinity,
  indentAmount: number = 2
) => {
  function indent(n: number) {
    return "".padEnd(n * indentAmount, " ");
  }

  return {
    exprmax(e: ASTNode<Expr>) {
      return this.expr(e, { precedence: maxPrecedence });
    },

    expr(e: ASTNode<Expr>, c: ExprCtx): string {
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
          return `${this.expr(e.data.condition, p)} ? ${this.expr(
            e.data.ifTrue,
            p
          )} : ${this.expr(e.data.ifFalse, p)}`;
        case "binary-op": {
          const prec = c.precedence;
          const c2 = {
            precedence: binaryPrecedences[e.data.op],
          };
          if (e.data.op == "[]") {
            const left = this.expr(e.data.left, c2);
            const right = this.expr(e.data.right, {
              precedence: maxPrecedence,
            });
            return `${prec < c2.precedence ? `(${left})` : left}[${right}]`;
          }

          const baseExpr = `${this.expr(e.data.left, c2)} ${
            e.data.op
          } ${this.expr(e.data.right, { precedence: c2.precedence - 1 })}`;
          return prec < c2.precedence ? `(${baseExpr})` : baseExpr;
        }
        case "field-access":
          return `${this.expr(e.data.left, {
            precedence: minPrecedence,
          })}.${this.expr(e.data.right, c)}`;
        case "unary-op": {
          const prec = c.precedence;
          const c2 = {
            precedence: unaryPrecedences[e.data.op],
          };
          const operand = this.expr(e.data.left, c2);
          const baseExpr = e.data.isAfter
            ? `${operand}${e.data.op}`
            : `${e.data.op}${operand}`;
          return prec < c2.precedence ? `(${baseExpr})` : baseExpr;
        }
        case "assignment":
          return `${this.expr(e.data.left, {
            precedence: maxPrecedence,
          })} ${e.data.op} ${this.expr(e.data.right, {
            precedence: maxPrecedence,
          })}`;
        case "function-call":
          return `${this.functionCallIdentifier(e.data.identifier)}(${
            e.data.isVoid
              ? "void"
              : e.data.args
                  .map((arg) => this.expr(arg, { precedence: maxPrecedence }))
                  .join(", ")
          })`;
        case "function-call-field-access":
          return `${this.expr(e.data.left, {
            precedence: minPrecedence,
          })}.${this.expr(e.data.right, { precedence: minPrecedence })}`;
        case "error":
          return "###ERROR###";
      }
    },

    functionCallIdentifier(i: FunctionIdentifier): string {
      if (i.type === "function-identifier") return i.identifier;

      return this.typeSpecifierNoCommented(i);
    },
    typeSpecifier(ts: Commented<TypeSpecifier>): string {
      return this.typeSpecifierNoCommented(ts.data);
    },

    typeSpecifierNoCommented(ts: TypeSpecifier) {
      return `${
        ts.precision ? this.precision(ts.precision) + " " : ""
      }${this.typeNoPrec(ts.specifier)}`;
    },

    precision(p: Commented<Precision>): string {
      return p.data;
    },

    typeNoPrec(tnp: Commented<TypeNoPrec>): string {
      switch (tnp.data.arrayType.type) {
        case "none":
          return this.typeSpecifierNonarray(tnp.data.typeName);
        case "static":
          return `${this.typeSpecifierNonarray(
            tnp.data.typeName
          )}[${this.exprmax(tnp.data.arrayType.size)}]`;
        case "dynamic":
          return `${this.typeSpecifierNonarray(tnp.data.typeName)}[]`;
      }
    },

    typeSpecifierNonarray(tsn: Commented<TypeSpecifierNonarray>): string {
      switch (tsn.data.type) {
        case "builtin":
        case "custom":
          return tsn.data.name.data;
        case "struct":
          return this.structSpecifier(tsn.data.struct);
      }
    },

    structSpecifier(ss: Commented<StructSpecifier>): string {
      return `struct ${
        ss.data.name ? ss.data.name.data : ""
      }{${this.structDeclarationList(ss.data.members)}}`;
    },

    structDeclarationList(sdl: Commented<StructDeclarationList>): string {
      return sdl.data.map((s) => this.structDeclaration(s)).join("");
    },

    structDeclaration(sd: Commented<StructDeclaration>): string {
      return `${
        sd.data.typeQualifier
          ? this.typeQualifier(sd.data.typeQualifier) + " "
          : ""
      }${this.typeSpecifier(sd.data.typeSpecifier)} ${this.structDeclaratorList(
        sd.data.declaratorList
      )};`;
    },

    structDeclaratorList(sdl: Commented<StructDeclaratorList>): string {
      return sdl.data.map((s) => this.structDeclarator(s)).join(",");
    },

    structDeclarator(sd: Commented<StructDeclarator>) {
      return (
        `${sd.data.name}` +
        (sd.data.isArray
          ? `[${
              sd.data.isArray.expr ? this.exprmax(sd.data.isArray.expr) : ""
            }]`
          : "")
      );
    },

    parameterDeclaration(pd: Commented<ParameterDeclaration>): string {
      return `${
        pd.data.parameterTypeQualifier
          ? this.parameterTypeQualifier(pd.data.parameterTypeQualifier) + " "
          : ""
      }${
        pd.data.parameterQualifier
          ? this.parameterQualifier(pd.data.parameterQualifier) + " "
          : ""
      }${
        pd.data.declaratorOrSpecifier.type === "declarator"
          ? this.parameterDeclarator(pd.data.declaratorOrSpecifier.declarator)
          : this.typeSpecifier(pd.data.declaratorOrSpecifier.specifier)
      }`;
    },

    parameterDeclarator(pd: Commented<ParameterDeclarator>): string {
      return (
        `${this.typeSpecifier(pd.data.typeSpecifier)} ${
          pd.data.identifier.data
        }` + (pd.data.arraySize ? `[${this.exprmax(pd.data.arraySize)}]` : "")
      );
    },

    parameterTypeQualifier(ptq: Commented<ParameterTypeQualifier>) {
      return "const";
    },

    parameterQualifier(pq: Commented<ParameterQualifier>): string {
      return pq.data;
    },

    typeQualifier(tq: Commented<TypeQualifier>): string {
      switch (tq.data.type) {
        case "sq":
          return this.storageQualifier(tq.data.storageQualifier);
        case "intq-sq":
          return [
            [this.interpolationQualifier(tq.data.interpolationQualifier)],
            tq.data.storageQualifier
              ? [this.storageQualifier(tq.data.storageQualifier)]
              : [],
          ]
            .flat(1)
            .join(" ");
        case "lq-sq":
          return [
            [this.layoutQualifier(tq.data.layoutQualifier)],
            tq.data.storageQualifier
              ? [this.storageQualifier(tq.data.storageQualifier)]
              : [],
          ]
            .flat(1)
            .join(" ");
        case "invq-intq-sq":
          return [
            this.invariantQualifier(tq.data.invariantQualifier),
            tq.data.interpolationQualifier
              ? [this.interpolationQualifier(tq.data.interpolationQualifier)]
              : [],
            this.storageQualifier(tq.data.storageQualifier),
          ]
            .flat(1)
            .join(" ");
      }
    },

    invariantQualifier(iq: Commented<InvariantQualifier>): string {
      return iq.data;
    },

    layoutQualifier(lq: Commented<LayoutQualifier>): string {
      return `layout(${lq.data
        .map((d) => this.layoutQualifierId(d))
        .join(" ")})`;
    },

    layoutQualifierId(lqid: Commented<LayoutQualifierId>): string {
      if (lqid.data.value !== undefined) {
        return `${lqid.data.identifier}=${lqid.data.value}`;
      }
      return lqid.data.identifier;
    },

    storageQualifier(sq: Commented<StorageQualifier>): string {
      return sq.data;
    },

    interpolationQualifier(iq: Commented<InterpolationQualifier>): string {
      return iq.data;
    },

    initDeclaratorList(idl: Commented<InitDeclaratorList>): string {
      const start = this.singleDeclarationStart(idl.data.init);

      const hasSpace = !start.endsWith("}");

      return `${start}${hasSpace ? " " : ""}${idl.data.declarations.data
        .map((d) => this.singleDeclaration(d))
        .join(", ")}`;
    },

    singleDeclarationStart(sds: Commented<SingleDeclarationStart>): string {
      switch (sds.data.type) {
        case "type":
          return this.fullySpecifiedType(sds.data.declType);
        case "invariant":
          return "invariant";
      }
    },

    singleDeclaration(sd: Commented<SingleDeclaration>): string {
      if (!sd.data.variant) {
        return sd.data.name.data;
      }
      switch (sd.data.variant.data.type) {
        case "initialized":
          return `${sd.data.name.data} = ${this.exprmax(
            sd.data.variant.data.initializer
          )}`;
        case "initialized-array":
          return `${sd.data.name.data}[${
            sd.data.variant.data.size
              ? this.exprmax(sd.data.variant.data.size)
              : ""
          }]=${this.exprmax(sd.data.variant.data.initializer)}`;
        case "sized-array":
          return `${sd.data.name.data}[${this.exprmax(
            sd.data.variant.data.size
          )}]`;
      }
    },

    declaration(d: Commented<Declaration>): string {
      switch (d.data.type) {
        case "function-prototype":
          return `${this.functionPrototype(d.data.prototype)};`;
        case "declarator-list":
          return this.initDeclaratorList(d.data.declaratorList) + ";";
        case "type-specifier":
          return `precision ${this.precision(
            d.data.precision
          )} ${this.typeNoPrec(d.data.specifier)};`;
        case "type-qualifier":
          return `${this.typeQualifier(d.data.typeQualifier)};`;
        case "struct":
          return `${this.typeQualifier(d.data.typeQualifier)} ${
            d.data.name
          }{${this.structDeclarationList(d.data.declarationList)}}${
            d.data.name2 ?? ""
          }${
            d.data.constantExpr ? `[${this.exprmax(d.data.constantExpr)}]` : ""
          };`;
      }
    },

    statement(s: ASTNode<Stmt>, ctx: NodeCtx = defaultNodeCtx): string {
      switch (s.data.type) {
        case "expr":
          return `${s.data.expr ? this.exprmax(s.data.expr) : ""};`;
        case "break":
          return "break;";
        case "case":
          return `case ${this.exprmax(s.data.expr)}:`;
        case "continue":
          return "continue;";
        case "discard":
          return "discard;";
        case "declaration":
          return this.declaration(s.data.decl);
        case "switch":
          return `switch(${this.exprmax(s.data.expr)}){${s.data.stmts
            .map((s) => this.statement(s))
            .join("")}}`;
        case "default-case":
          return "default:";
        case "return":
          return `return${s.data.expr ? " " + this.exprmax(s.data.expr) : ""};`;
        case "selection":
          return `if(${this.exprmax(s.data.cond)})${this.selectionRestStmt(
            s.data.rest
          )}`;
        case "while":
          return `while(${this.condition(s.data.cond)})${this.statement(
            s.data.body
          )}`;
        case "do-while":
          return `do ${this.statement(s.data.body)}while(${this.exprmax(
            s.data.cond
          )});`;
        case "compound":
          return `{\n${s.data.statements
            .map((e) => indent(ctx.indent + 1) + this.statement(e))
            .join("\n")}\n}`;
        case "for":
          return `for(${this.statement(s.data.init)}${this.forRestStatement(
            s.data.rest
          )})${this.statement(s.data.body)}`;
      }
    },

    forRestStatement(frs: Commented<ForRestStatement>): string {
      return `${frs.data.condition ? this.condition(frs.data.condition) : ""};${
        frs.data.expr ? this.exprmax(frs.data.expr) : ""
      }`;
    },

    selectionRestStmt(srs: Commented<SelectionRestStmt>): string {
      return `${this.statement(srs.data.if)}${
        srs.data.else ? `else ${this.statement(srs.data.else)}` : ""
      }`;
    },

    condition(c: Commented<Condition>) {
      if (c.data.type === "expr") {
        return this.exprmax(c.data.expr);
      }

      return `${this.fullySpecifiedType(
        c.data.fullySpecifiedType
      )}=${this.exprmax(c.data.initializer)}`;
    },
    fullySpecifiedType(fst: Commented<FullySpecifiedType>): string {
      return (
        (fst.data.qualifier
          ? this.typeQualifier(fst.data.qualifier) + " "
          : "") + this.typeSpecifier(fst.data.specifier)
      );
    },

    functionPrototype(fp: Commented<FunctionHeader>): string {
      return (
        this.fullySpecifiedType(fp.data.fullySpecifiedType) +
        " " +
        fp.data.name.data +
        "(" +
        (fp.data.parameters?.data
          .map((param) => this.parameterDeclaration(param))
          .join(", ") ?? "") +
        ")"
      );
    },
    translationUnit(tr: TranslationUnit): string {
      return tr.data.map((decl) => this.externalDeclaration(decl)).join("\n\n");
    },

    externalDeclaration(ed: ASTNode<ExternalDeclaration>): string {
      if (ed.data.type === "function") {
        return (
          this.functionPrototype(ed.data.prototype) +
          " " +
          this.statement(ed.data.body)
        );
      }

      return this.declaration(ed.data.decl);
    },
  };
};
