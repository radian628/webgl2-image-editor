import { createVirtualFilesystem } from "../../filesystem/FilesystemAdaptor";
import { parseGLSLWithoutPreprocessing } from "../parser-combined";
import { makeGLSLLanguageServer } from "./glsl-language-server";
import { test, expect } from "bun:test";

async function compareAAndB(src: string) {
  const vfs = createVirtualFilesystem({
    type: "dir",
    name: "root",
    contents: new Map([
      [
        "a.glsl",
        {
          type: "file",
          name: "a.glsl",
          contents: new Blob([src]),
        },
      ],
    ]),
  });

  const service = makeGLSLLanguageServer({
    fs: vfs,
  });

  const result = await service.evaluate("root/a.glsl", "main");

  expect(result).toBeDefined();

  const aVal = result!.values.get("a")!;
  const bVal = result!.values.get("b")!;

  expect(aVal).toBeDefined();
  expect(bVal).toBeDefined();

  expect(aVal.value.type === "error").toBe(false);
  expect(aVal.value.type === "error").toBe(false);
  expect(aVal.value.type === "uninitialized").toBe(false);
  expect(aVal.value.type === "uninitialized").toBe(false);

  expect(aVal.value).toEqual(bVal.value);
}

function evalToSame(
  a: string,
  b: string,
  typename: string = "float",
  btype: string = typename
) {
  test(`${a} -> ${b}`, async () => {
    const src = `
  ${typename} a;
  ${btype ?? typename} b;

  void main() {
    a = ${a};
    b = ${b}; 
  }`;

    await compareAAndB(src);
  });
}

function evalToSameMultiStatement(
  a: string,
  b: string,
  typename: string = "float",
  btype: string = typename
) {
  test(`${a} -> ${b}`, async () => {
    const src = `
  ${typename} a;
  ${btype ?? typename} b;

  void main() {
    ${a}
    b = ${b}; 
  }`;

    await compareAAndB(src);
  });
}

function evalToSameGeneric(name: string, str: string) {
  test(name, async () => {
    await compareAAndB(str);
  });
}

// primitive operations
evalToSame("1", "1", "int");
evalToSame("1.0", "1.0", "float");
evalToSame("1.00", "1.0", "float");
evalToSame("1u", "1u", "uint");
evalToSame("1.0 + 1.0", "2.0", "float");
evalToSame("1 + 1", "2", "int");
evalToSame("1u + 1u", "2u", "uint");
evalToSame("true ? 1 : 2", "1", "int");
evalToSame("false ? 1 : 2", "2", "int");
evalToSame("2 > 1", "true", "bool");
evalToSame("1 > 2", "false", "bool");
evalToSame("1 == 1", "true", "bool");
evalToSame("2 == 1", "false", "bool");
evalToSame("true && true", "true", "bool");
evalToSame("false && true", "false", "bool");

// vector operations
evalToSame("vec2(1.0)", "vec2(1.0)", "vec2");
evalToSame("vec2(1.0, 1.0)", "vec2(1.0)", "vec2");
evalToSame("vec2(vec2(1.0))", "vec2(1.0)", "vec2");
evalToSame("vec3(vec2(3.0), 4.0)", "vec3(3.0, 3.0, 4.0)", "vec3");
evalToSame("vec4(vec2(1.0), vec2(3.0))", "vec4(1.0, 1.0, 3.0, 3.0)", "vec4");
evalToSame("1 + 2 + 3 + 4", "10", "int");
evalToSame("7 & 14", "6", "int");
evalToSame("vec2(1.0, 2.0) + 3.0", "vec2(4.0, 5.0)", "vec2");
evalToSame("vec2(1.0, 2.0).yx", "vec2(2.0, 1.0)", "vec2");
evalToSame("vec2(1.0, 2.0).x", "1.0", "float", "float");

//arrays
evalToSame("float[1](1.0)[0]", "1.0", "float", "float");
evalToSame("float[](1.0)[0]", "1.0", "float", "float");
evalToSame("float[](1.0)", "float[1](1.0)", "float[1]", "float[1]");
evalToSame("float[](1.0, 3.0)", "float[2](1.0, 3.0)", "float[2]", "float[2]");
evalToSame("float[](1.0, 3.0).length()", "2", "int");

// if statements
evalToSameMultiStatement(
  `if (true) {
  a = 1.0;
}`,
  "1.0"
);
evalToSameMultiStatement(
  `if (true) 
    a = 1.0;
`,
  "1.0"
);
evalToSameMultiStatement(
  `if (true) {
  a = 1.0;
} else {
  a = 2.0;
}`,
  "1.0"
);
evalToSameMultiStatement(
  `if (false) {
  a = 1.0;
} else {
  a = 2.0;
}`,
  "2.0"
);
evalToSameMultiStatement(
  `
a = 5.0;
if (false) {
  a = 1.0;
}`,
  "5.0"
);

// while loops
evalToSameMultiStatement(
  `
a = 0;
while (a < 10) a += 3;
`,
  "12",
  "int"
);
evalToSameMultiStatement(
  `
a = 0;
while (true) { 
  a += 3;
  break;
}
`,
  "3",
  "int"
);
evalToSameMultiStatement(
  `
a = 0;
while (true) { 
  a += 3;
  if (a > 10) break;
}
`,
  "12",
  "int"
);

// for loops
evalToSameMultiStatement(
  `
a = 0;
for (int i = 0; i < 10; i++) a += i;
`,
  "45",
  "int"
);

// switch statement
evalToSameMultiStatement(
  `
switch (3) {
  case 1:
    a = 1;
  case 3:
    a = 3;
}
  `,
  "3",
  "int"
);
evalToSameMultiStatement(
  `
switch (3) {
  case 1:
    a = 1;
  case 3:
    a = 3;
  case 5:
    a = 5;
}
  `,
  "5",
  "int"
);
evalToSameMultiStatement(
  `
switch (7) {
  case 1:
    a = 1;
  case 3:
    a = 3;
  case 5:
    a = 5;
  default:
    a = 7;
}
  `,
  "7",
  "int"
);
evalToSameMultiStatement(
  `
a = 10;
switch (7) {
  case 1:
    a = 1;
  case 3:
    a = 3;
  case 5:
    a = 5;
}
  `,
  "10",
  "int"
);
evalToSameMultiStatement(
  `
a = 10;
switch (3) {
  case 1:
    a = 1;
  case 3:
    a = 3;
    break;
  case 5:
    a = 5;
}
  `,
  "3",
  "int"
);

evalToSameGeneric(
  "Function call",
  `

float a;
float b;

float dbl(float x) {
  return x * 2.0;
}

void main () {
  a = 1.0;
  a = dbl(a);
  b = 2.0;
}
`
);
evalToSameGeneric(
  "Function with two args",
  `

float a;
float b;

float add(float a, float b) {
  return a + b;
}

void main () {
  a = add(0.5, 1.5);
  b = 2.0;
}
`
);
for (const stmt of ["if (true) {", "while (true) {", "for (;;) {"]) {
  evalToSameGeneric(
    "Return from '" + stmt + "'",
    `

float a;
float b;

float id(float x) {
  ${stmt}
    return x; 
  }
}

void main () {
  a = id(2.0);
  b = 2.0;
}
`
  );
}
