import { test, expect } from "bun:test";
import { parseGLSLWithoutPreprocessing } from "../parser-combined";
import { createVirtualFilesystem } from "../../filesystem/FilesystemAdaptor";
import { makeGLSLLanguageServer } from "./glsl-language-server";

async function checkTypechecker(expectNoErrors: boolean, glsl: string) {
  const vfs = createVirtualFilesystem({
    type: "dir",
    name: "root",
    contents: new Map([
      [
        "a.glsl",
        {
          type: "file",
          name: "a.glsl",
          contents: new Blob([glsl]),
        },
      ],
    ]),
  });

  const service = makeGLSLLanguageServer({
    fs: vfs,
  });

  const typecheck = await service.getDiagnostics("root/a.glsl");

  const success = typecheck?.length === 0;

  if (success !== expectNoErrors) {
    console.log(typecheck);
  }

  expect(success).toEqual(expectNoErrors);
}

function typeCorrect(mainFnContents: string, beforeMainFnContents?: string) {
  test(`should succeed: '${mainFnContents}'`, async () => {
    await checkTypechecker(
      true,
      `#version 300 es
precision highp float;
${beforeMainFnContents ?? ""}
void main() {
  ${mainFnContents}
}`
    );
  });
}

function typeError(mainFnContents: string, beforeMainFnContents?: string) {
  test(`should fail: '${mainFnContents}'`, async () => {
    await checkTypechecker(
      false,
      `#version 300 es
precision highp float;
${beforeMainFnContents ?? ""}
void main() {
  ${mainFnContents}
}`
    );
  });
}

// basic expressions
typeCorrect("1.0;");
typeCorrect("1;");
typeCorrect("1u;");
typeCorrect("true;");
typeCorrect("false;");

// arithmetic
typeCorrect("1 + 2;");
typeCorrect("1 - 2;");
typeCorrect("1 * 2;");
typeCorrect("1 / 2;");
typeCorrect("1u + 2u;");
typeCorrect("1.0 + 2.0;");

typeError("1.0 + 2;");
typeError("1 + 2.0;");
typeError("1u + 2;");
typeError("1 + 2u;");

// vectors
typeCorrect("vec2(1.0);");
typeCorrect("vec2(1);");
typeCorrect("vec2(1.0, 2.0);");
typeCorrect("vec2(1, 2);");
typeCorrect("vec2(1, 2.0);");
typeCorrect("vec2(vec2(2.0, 1.0));");
typeCorrect("ivec2(1.0);");
typeCorrect("ivec2(1);");
typeCorrect("uvec2(1);");
typeCorrect("uvec2(1u);");
typeCorrect("bvec2(true);");
typeCorrect("bvec2(true, false);");
typeCorrect("vec4(vec2(1.0), vec2(2.0));");

typeCorrect("vec2(2.0) + 1.0;");
typeCorrect("1.0 + vec2(2.0);");
typeCorrect("vec2(1.0) + vec2(2.0);");

typeError("vec2(1.0) + vec3(1.0)");
typeError("vec2(1.0) + ivec2(1)");

// conditionals
typeCorrect(`true ? 1 : 2;`);
typeCorrect(`true ? 1.0 : 2.0;`);
typeCorrect(`true ? 1u : 2u;`);
typeCorrect(`true ? true ? 1 : 2 : 3;`);
typeCorrect(`true ? true ? 1 : 2 : true ? 3 : 4;`);

typeError("true ? 1 : 2u;");
typeError("true ? 1.0 : 2u;");
typeError("1 ? 1.0 : 2.0;");
typeError("3.0 ? 1.0 : 2.0;");
typeError("3.0 ? 1.0 : 2;");

// bitwise operators
typeCorrect("1 & 1;");
typeCorrect("1 ^ 1;");
typeCorrect("1 | 1;");
typeCorrect("1u & 1u;");
typeCorrect("ivec2(1) & 1;");
typeCorrect("ivec2(1) & ivec2(1);");

typeError("1u & 1;");
typeError("1.0 & 1;");
typeError("1 & 1.0;");
typeError("1.0 & 1.0;");
typeError("vec2(1.0) & 1.0;");
typeError("vec2(1.0) & vec2(1.0);");
typeError("ivec3(1) & ivec2(1);");

// logical operators
typeCorrect("true && true;");
typeCorrect("true || true;");
typeCorrect("true ^^ true;");

typeError("1 ^^ true;");
typeError("true ^^ 1;");
typeError("1 ^^ 1;");
typeError("bvec2(true) ^^ bvec2(true);");

// function calls
const add = `float add(float a, float b) { return a + b; }`;
typeCorrect("add(1.0, 2.0);", add);
typeCorrect("1.0 + add(1.0, 2.0);", add);
typeCorrect("vec2(1.0) + add(1.0, 2.0);", add);
typeCorrect("vec2(1.0) + add(1.0, 2.0);", add);

typeError("add(1, 2.0);", add);
typeError("add(2.0);", add);
typeError("add(vec2(1.0));", add);
typeError("add(vec2(1.0), 1.0);", add);
typeError("add(1.0, 1);", add);
typeError("add();", add);

// multiple overloads
const addTwoOverloads = `float add(float a) { return a; } float add(float a, float b) { return a + b; } `;
typeCorrect("add(1.0);", addTwoOverloads);
typeCorrect("add(1.0, 2.0);", addTwoOverloads);

typeError("add(1.0, 2.0, 3.0);", addTwoOverloads);
typeError("add(1.0, 2.0, 3);", addTwoOverloads);
typeError("add(1 + 1.0, 2.0, 3);", addTwoOverloads);
typeError("add(1 + 1.0);", addTwoOverloads);
typeError("add(1.0 + 1);", addTwoOverloads);
typeError("add();", addTwoOverloads);

// redefinition
typeError("", "float test() {} float test;");

// assignment
typeCorrect("float x; x = 3.0;");
typeCorrect("float x; x = 3.0 + 4.0;");

typeError("float x; x = 3;");
typeError("float x; x = 3u;");
typeError("float x; x = false;");
typeError("float x; x = float[](1.0, 1.0);");
typeError("float x; x = vec2(1.0, 1.0);");

// definition
typeCorrect("float x = 3.0;");

typeError("float x = 3;");
typeError("float x = 3u;");
typeError("float x = false;");
typeError("float x = float[](1.0, 1.0);");
typeError("float x = vec2(1.0, 1.0);");
typeError("float x = ivec2(1.0, 1.0);");

// array definitions
typeCorrect("float x[1];");
typeCorrect("float x[3];");

typeError("float x[1.0];");

// array literals
typeCorrect("vec2 x[1] = vec2[1](vec2(1.0));");
typeCorrect("vec2 x[2] = vec2[2](vec2(1.0), vec2(1.0));");

typeError("float x[1] = f[1](1.0);", "float f(float x) { return x; }");

// array iniitialization
typeCorrect("float x[1] = float[1](1.0);");
typeCorrect("float x[1] = float[](1.0);");
typeCorrect("float x[2] = float[2](1.0, 1.0);");
typeCorrect("float x[2] = float[](1.0, 2.0);");

typeError("float x[1] = float[1.0](1.0);");
typeError("float x[1] = float[2](1.0);");
typeError("float x[1] = float[2](1.0, 1.0);");
typeError("float x[1] = float[2](1.0, 1.0);");
typeError("float x[2] = float[2](1.0, 1.0, 1.0);");
typeError("float x[2] = float[3](1.0, 1.0, 1.0);");
typeError("float x[2] = float[3](1.0, 1.0);");
typeError("float x[2] = float[1](1.0, 1.0);");
typeError("float x[2] = float[2](1, 1.0);");
typeError("float x[2] = float[2](1.0, 1);");
typeError("float x[2] = float[2](1, 1);");
typeError("float x[2] = float[2](1, 1.0);");
typeError("float x[2.0] = float[2](1.0, 1.0);");
