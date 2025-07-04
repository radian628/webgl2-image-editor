import { expect, test } from "bun:test";
import {
  lexGLSL,
  parseGLSLWithoutPreprocessing,
  tryParseGLSLRaw,
} from "./parser-combined";
import {
  assignment_expression,
  declaration,
  expression,
  external_declaration,
  fully_specified_type,
  function_call,
  function_call_generic,
  function_call_header,
  function_call_header_no_parameters,
  function_call_header_with_parameters,
  init_declarator_list,
  integer_expression,
  layout_qualifier,
  layout_qualifier_id,
  multiplicative_expression,
  postfix_expression,
  primary_expression,
  statement,
  translation_unit,
  unary_expression,
} from "./parser";
import { Parser, seq } from "typescript-parsec";
import { TokenKind } from "./lexer";
import { FormatGLSLPacked } from "./formatter/fmt-packed";

test("2+2", () => {
  expect(2 + 2).toBe(4);
});

function stripNewlines(str: string) {
  return str.replaceAll("\n", "");
}

function roundtrip<T>(
  parserType: string,
  input: string,
  expected: string,
  parser: Parser<TokenKind, T>,
  stringifier: (t: T) => string,
  doCommented: boolean
) {
  test(`${parserType} roundtrip: ${input} -> ${expected}`, () => {
    const tokens = lexGLSL(input).unsafeExpectSuccess();
    const parsed = tryParseGLSLRaw(tokens, parser);
    const stringified = stringifier(parsed);
    expect(stringified).toEqual(expected);

    const tokens2 = lexGLSL(stringified).unsafeExpectSuccess();
    const parsed2 = tryParseGLSLRaw(tokens2, parser);
    expect(stringified).toEqual(stringifier(parsed2));
  });

  if (doCommented) {
    test(`${parserType} roundtrip (commented): ${input} -> ${expected}`, () => {
      const tokens = lexGLSL(input).unsafeExpectSuccess();
      let commentedInput = "";
      let currToken = tokens;
      while (currToken) {
        commentedInput += " /* */ " + currToken.text;
        currToken = currToken.next;
      }

      const commentedTokens = lexGLSL(commentedInput).unsafeExpectSuccess();

      const parsedCommented = tryParseGLSLRaw(commentedTokens, parser);
      expect(stringifier(parsedCommented)).toEqual(expected);
    });
  }
}

function roundtripExpr(input: string, expected: string) {
  return roundtrip(
    "expr",
    input,
    expected,
    expression,
    FormatGLSLPacked.exprmax,
    true
  );
}

function roundtripDecl(input: string, expected: string) {
  return roundtrip(
    "decl",
    input,
    expected,
    declaration,
    FormatGLSLPacked.declaration,
    true
  );
}

function roundtripExtDecl(input: string, expected: string) {
  return roundtrip(
    "extdecl",
    input,
    expected,
    external_declaration,
    FormatGLSLPacked.externalDeclaration,
    true
  );
}

function roundtripStmt(input: string, expected: string) {
  return roundtrip(
    "stmt",
    input,
    expected,
    statement,
    FormatGLSLPacked.statement,
    true
  );
}

roundtripExpr("12345", "12345");
roundtripExpr("0x69", "0x69");
roundtripExpr("0420", "0420");
roundtripExpr("12345u", "12345u");
roundtripExpr("12345U", "12345U");
roundtripExpr("-1", "-1");
roundtripExpr("~-1", "~-1");
roundtripExpr("!~-1", "!~-1");
roundtripExpr("!1", "!1");
roundtripExpr("~1", "~1");
roundtripExpr("++1", "++1");
roundtripExpr("--1", "--1");
roundtripExpr("1++", "1++");
roundtripExpr("1--", "1--");
roundtripExpr("1*1", "1*1");
for (let op of [
  "*",
  "/",
  "%",
  "+",
  "-",
  "||",
  "&&",
  "^^",
  ">",
  "<",
  ">=",
  "<=",
  "==",
  "!=",
  "|",
  "&",
  "^",
  "<<",
  ">>",
]) {
  roundtripExpr(`1 ${op} 1`, `1${op}1`);
}
roundtripExpr("1 * 2 + 3", "1*2+3");
roundtripExpr("1 * (2 + 3)", "1*(2+3)");
roundtripExpr("1 - 2 - 3", "1-2-3");
roundtripExpr("1 + 2 + 3 + 4", "1+2+3+4");
roundtripExpr("1-(2-3)", "1-(2-3)");
roundtripExpr("(1-2)-3", "1-2-3");
roundtripExpr("true", "true");
roundtripExpr("false", "false");
roundtripExpr("1.0", "1.0");
roundtripExpr("0.0", "0.0");
roundtripExpr("0.1", "0.1");
roundtripExpr("1.", "1.");
roundtripExpr(".1", ".1");
roundtripExpr("0.", "0.");
roundtripExpr(".0", ".0");
roundtripExpr("1.0e2", "1.0e2");
roundtripExpr("1.0E2", "1.0E2");
roundtripExpr("1.0+e2", "1.0+e2");
roundtripExpr("1.0-e2", "1.0-e2");
roundtripExpr("1.0e22", "1.0e22");
roundtripExpr("1.0f", "1.0f");
roundtripExpr("1.0F", "1.0F");
roundtripExpr("1.0e2f", "1.0e2f");
roundtripExpr("1 ? 1 : 1", "1?1:1");
roundtripExpr("a", "a");
roundtripExpr("_a", "_a");
roundtripExpr("_", "_");
roundtripExpr("A", "A");
roundtripExpr("a = 1", "a=1");
roundtripExpr("a = b", "a=b");
roundtripExpr("a = b = c", "a=b=c");
for (let op of ["*", "/", "%", "+", "-", "<<", ">>", "&", "|", "^"]) {
  roundtripExpr(`a ${op}= b`, `a${op}=b`);
}
roundtripExpr("a[b]", "a[b]");
roundtripExpr("(1 + 2)[b]", "(1+2)[b]");
roundtripExpr("!(1 + 2)", "!(1+2)");
roundtripExpr("a = 1 + 1", "a=1+1");
roundtripExpr("f()", "f()");
roundtripExpr("f(1)", "f(1)");
roundtripExpr("f(1, 2)", "f(1,2)");
roundtripExpr("f(1, 2, 3)", "f(1,2,3)");
roundtripExpr("f(g())", "f(g())");
roundtripExpr("f(void)", "f(void)");
roundtripExpr("1 // \n + 1", "1+1");
roundtripExpr("v.x = 1.0", "v.x=1.0");
roundtripExpr("a.b.x = 1.0", "a.b.x=1.0");
roundtripExpr("v.length()", "v.length()");
roundtripExpr("a().b", "a().b");
roundtripExpr("a().b.c()", "a().b.c()");
roundtripExpr("a.b()", "a.b()");
roundtripExpr("a().b()", "a().b()");
roundtripExpr("a.b(x)", "a.b(x)");

roundtripDecl("precision highp float;", "precision highp float;");
roundtripDecl("float x;", "float x;");
roundtripDecl("float x = 1.0;", "float x=1.0;");
roundtripDecl("struct A { float a; } a;", "struct A{float a;}a;");
roundtripDecl("struct A { float a; };", "struct A{float a;};");

roundtrip(
  "fully_specified_type",
  "struct A { float a; }",
  "struct A{float a;}",
  fully_specified_type,
  FormatGLSLPacked.fullySpecifiedType,
  true
);
roundtrip(
  "init_declarator_list",
  "struct A { float a; }",
  "struct A{float a;}",
  init_declarator_list,
  FormatGLSLPacked.initDeclaratorList,
  true
);

roundtripStmt("float x;", "float x;");
roundtripStmt("float x = 1.0;", "float x=1.0;");
roundtripStmt("x = 1.0;", "x=1.0;");
roundtripStmt("break;", "break;");
roundtripStmt("continue;", "continue;");
roundtripStmt("discard;", "discard;");
roundtripStmt("return;", "return;");
roundtripStmt("return 5;", "return 5;");
roundtripStmt("return vec2(1.0, 2.0);", "return vec2(1.0,2.0);");
roundtripStmt("case 3:", "case 3:");
roundtripStmt("default:", "default:");
roundtripStmt("if (1) 2;", "if(1)2;");
roundtripStmt("if (1) 2; else 3;", "if(1)2;else 3;");
roundtripStmt("while (1) 1;", "while(1)1;");
roundtripStmt("do 1; while (1);", "do 1;while(1);");
roundtripStmt("do {1;1;} while (1);", "do {1;1;}while(1);");
roundtripStmt(
  "for (int i = 0; i < 10; i++) x += i;",
  "for(int i=0;i<10;i++)x+=i;"
);
roundtripStmt("switch (1) { }", "switch(1){}");
roundtripStmt("switch (1) {1;}", "switch(1){1;}");
roundtripStmt("float x[1] = float[1](1.0);", "float x[1]=float[1](1.0);");
roundtripStmt("float x[1] = float[](1.0);", "float x[1]=float[](1.0);");
roundtripStmt(
  "float x[2] = float[2](1.0, 1.0);",
  "float x[2]=float[2](1.0,1.0);"
);
roundtripStmt(
  "float x[2] = float[](1.0, 2.0);",
  "float x[2]=float[](1.0,2.0);"
);
roundtripStmt("float x[1];", "float x[1];");

roundtripExtDecl("float x = 1.0;", "float x=1.0;");
roundtripExtDecl("void main(){}", "void main(){}");
roundtripExtDecl(
  "void main(){float x = 1.0; x += 1.0;}",
  "void main(){float x=1.0;x+=1.0;}"
);
roundtripExtDecl('import * from "test";', 'import*from"test";');
roundtripExtDecl('import * as poop from "test";', 'import*as poop from"test";');
roundtripExtDecl('import {} from "test";', 'import{}from"test";');
roundtripExtDecl('import { a } from "test";', 'import{a}from"test";');
roundtripExtDecl('import { a as b } from "test";', 'import{a as b}from"test";');
roundtripExtDecl('import { a, b } from "test";', 'import{a,b}from"test";');
roundtripExtDecl('import { a, b, c } from "test";', 'import{a,b,c}from"test";');
roundtripExtDecl(
  'import { a as b, c as d } from "test";',
  'import{a as b,c as d}from"test";'
);
roundtripExtDecl(
  'import { a, c as d } from "test";',
  'import{a,c as d}from"test";'
);
roundtripExtDecl(
  'import { a as b, c } from "test";',
  'import{a as b,c}from"test";'
);

roundtripDecl("uniform float test;", "uniform float test;");
roundtripDecl("uniform sampler2D test;", "uniform sampler2D test;");
roundtripDecl(
  "layout(row_major) uniform mat4 mvp;",
  "layout(row_major) uniform mat4 mvp;"
);
roundtripDecl("in vec3 test;", "in vec3 test;");

roundtrip(
  "layout_qualifier",
  "layout(row_major)",
  "layout(row_major)",
  layout_qualifier,
  FormatGLSLPacked.layoutQualifier,
  true
);

roundtrip(
  "layout_qualifier_id",
  "rowmajor",
  "rowmajor",
  layout_qualifier_id,
  FormatGLSLPacked.layoutQualifierId,
  true
);

roundtrip(
  "layout_qualifier_id",
  "row_major",
  "row_major",
  layout_qualifier_id,
  FormatGLSLPacked.layoutQualifierId,
  true
);

roundtrip(
  "translation_unit",
  `void main() {
  
}`,
  "void main(){}",
  external_declaration,
  FormatGLSLPacked.externalDeclaration,
  true
);

roundtrip(
  "translation_unit",
  `void main(float a, float b) {
  
}`,
  "void main(float a,float b){}",
  external_declaration,
  FormatGLSLPacked.externalDeclaration,
  true
);

roundtrip(
  "translation_unit",
  `void main(float a) {
  
}`,
  "void main(float a){}",
  external_declaration,
  FormatGLSLPacked.externalDeclaration,
  true
);

roundtrip(
  "translation_unit",
  `// use high-precision floating point numbers
precision highp float;

// position of the vertices as supplied from a buffer
in vec2 input_vertex_position;

// transformed vertex positions, which will be
// interpolated in the fragment shader
out vec2 vertex_position;

void main() {
  // position the actual vertices on the screen so that the entire
  // screen is covered by a square.
  // The third (z) component can be set to anything between 0 and 1.
  gl_Position = vec4(input_vertex_position, 0.5, 1.0);
  // pass a position value to the fragment shader
  vertex_position = input_vertex_position;
}`,
  "precision highp float;in vec2 input_vertex_position;out vec2 vertex_position;" +
    "void main(){gl_Position=vec4(input_vertex_position,0.5,1.0);vertex_position=input_vertex_position;}",
  translation_unit,
  FormatGLSLPacked.translationUnit,
  true
);

roundtrip(
  "translation_unit",
  `// use high-precision floating point numbers
precision highp float;

// vertex_position variable from the vertex shader
in vec2 vertex_position;

// color variable that we can write to to set the color
out vec4 frag_color;

void main() {

  // initialize Z and C values
  vec2 z = vec2(0.0);
  vec2 c = vertex_position * 2.0;

  float brightness = 0.0;

  for (int i = 0; i < ITERATIONS; i++) {
    // Z = Z^2 + C
    z = vec2(
      z.x * z.x - z.y * z.y,
      2.0 * z.x * z.y
    ) + c;

    // adjust brightness as long as |z| < 2
    if (length(z) < 2.0) {
      brightness = float(i) / float(ITERATIONS);
    }
  }

  // assign a grayscale color proportional to the number of iterations
  frag_color = vec4(vec3(brightness), 1.0);
}`,
  stripNewlines(`
precision highp float;
in vec2 vertex_position;
out vec4 frag_color;
void main(){
vec2 z=vec2(0.0);
vec2 c=vertex_position*2.0;
float brightness=0.0;
for(int i=0;i<ITERATIONS;i++){
z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;
if(length(z)<2.0){
brightness=float(i)/float(ITERATIONS);
}
}
frag_color=vec4(vec3(brightness),1.0);
}`),
  translation_unit,
  FormatGLSLPacked.translationUnit,
  true
);
