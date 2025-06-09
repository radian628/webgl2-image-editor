import { expect, test } from "bun:test";
import { lexGLSL, tryParseGLSLRaw } from "./parser-combined";
import { Parser } from "typescript-parsec";
import { TokenKind } from "./lexer";
import { renameSymbols } from "./glsl-ast-utils";
import { FormatGLSLPacked } from "./fmt-packed";
import { expression, statement, translation_unit } from "./parser";

function renameRoundtrip<T>(
  input: string,
  expected: string,
  parser: Parser<TokenKind, T>,
  stringifier: (t: T) => string
) {
  test(`rename: ${input} -> ${expected}`, () => {
    const tokens = lexGLSL(input).unsafeExpectSuccess();
    const parsed = renameSymbols(tryParseGLSLRaw(tokens, parser), (s) =>
      s === "a" ? "b" : s
    );
    const stringified = stringifier(parsed);
    expect(stringified).toEqual(expected);
  });
}

function renameExpr(input: string, expected: string) {
  return renameRoundtrip(input, expected, expression, FormatGLSLPacked.exprmax);
}

function renameStmt(input: string, expected: string) {
  return renameRoundtrip(
    input,
    expected,
    statement,
    FormatGLSLPacked.statement
  );
}

function renameTransUnit(input: string, expected: string) {
  return renameRoundtrip(
    input,
    expected,
    translation_unit,
    FormatGLSLPacked.translationUnit
  );
}

renameExpr("a", "b");
renameExpr("c", "c");
renameExpr("a+1", "b+1");
renameExpr("1+a", "1+b");
renameExpr("a+a", "b+b");
renameExpr("a()", "b()");
renameExpr("a++", "b++");
renameExpr("a.a", "b.a");
renameExpr("a(a,a)", "b(b,b)");
renameExpr("a?a:a", "b?b:b");
renameExpr("true", "true");
renameExpr("false", "false");
renameExpr("1", "1");
renameExpr("1.5", "1.5");
renameExpr("a=a", "b=b");
renameExpr("a().a", "b().a");

renameStmt("x=a;", "x=b;");
renameStmt("a=x;", "b=x;");
renameStmt("a=a;", "b=b;");
renameStmt("if(a)a;", "if(b)b;");
renameStmt("if(a)a;", "if(b)b;");
renameStmt("case a:", "case b:");
renameStmt("return a;", "return b;");
renameStmt("for(a;a;a)a;", "for(b;b;b)b;");

renameTransUnit("void a(){}", "void b(){}");
renameTransUnit("void c(float a){}", "void c(float b){}");
renameTransUnit("void c(float a){return a;}", "void c(float b){return b;}");
renameTransUnit("vec4 a;", "vec4 b;");
renameTransUnit("struct a{float a;};", "struct b{float a;};");
renameTransUnit("struct a{float a;}a;", "struct b{float a;}b;");
renameTransUnit("vec4 a[a];", "vec4 b[b];");
renameTransUnit("uniform float a;", "uniform float b;");
