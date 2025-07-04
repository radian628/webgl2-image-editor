import { createVirtualFilesystem } from "../../filesystem/FilesystemAdaptor";
import { parseGLSLWithoutPreprocessing } from "../parser-combined";
import { makeGLSLLanguageServer } from "./glsl-language-server";
import { test, expect } from "bun:test";

function evalToSame(a: string, b: string, typename: string = "float") {
  test(`${a} -> ${b}`, async () => {
    const src = `
  ${typename} a;
  ${typename} b;

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

    expect(aVal).toEqual(bVal);
  });
}

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
evalToSame("vec2(1.0)", "vec2(1.0)", "vec2");
