import { createVirtualFilesystem } from "../../filesystem/FilesystemAdaptor";
import { parseGLSLWithoutPreprocessing } from "../parser-combined";
import { makeGLSLLanguageServer } from "./glsl-language-server";
import { test, expect } from "bun:test";

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
evalToSame("vec2(1.0, 2.0).x", "1.0", "vec2", "float");

//arrays
evalToSame("float[1](1.0)[1]", "1.0", "float[1]", "float");
evalToSame("float[](1.0)[1]", "1.0", "float[1]", "float");
