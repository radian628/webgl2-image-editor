import { test, expect } from "bun:test";
import { makeFancyFormatter } from "../formatter/fmt-fancy";
import { bundleShaders, ResolvedPath } from "./shader-bundler";
import { err, ok, Result } from "../../utils/result";

const format = makeFancyFormatter(Infinity, 2);

function mapResolver(
  map: Record<string, string>
): (s: string) => Promise<Result<{ type: "string"; string: string }, string>> {
  return async function (p: string) {
    const str = map[p];
    if (str) {
      return ok({
        type: "string" as "string",
        string: str,
      });
    }
    return err("failed to find file");
  };
}

test("simple bundle shaders", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: "void main() {}",
      }),
      mainFunctionName: "main",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void main() {\n\n}`);
});

test("two files", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import * from "b"; void x() { f(); }`,
        b: `void f() { }`,
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void f() {

}

void x() {
  f();
}`);
});

test("mutual include files", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import * from "b"; void y() { z(); }`,
        b: `import * from "a"; void x() { y(); } void z() { }`,
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void z() {

}

void y() {
  z();
}

void x() {
  y();
}`);
});

test("specific include", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import { f } from "b"; void x() { f(); }`,
        b: `void f() { }`,
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void f() {

}

void x() {
  f();
}`);
});

test("specific include with alias", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import { f as f2 } from "b"; void x() { f2(); }`,
        b: `void f() { }`,
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void f() {

}

void x() {
  f();
}`);
});

test("all includes with prefix", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import * as b_ from "b"; void x() { b_f(); }`,
        b: `void f() { }`,
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void f() {

}

void x() {
  f();
}`);
});

test("dead code elimination (g does not need to exist)", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import * from "b"; void x() { f(); }`,
        b: `void f() { } void g() { }`,
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void f() {

}

void x() {
  f();
}`);
});

test("resolve namespace collision", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import * as b_ from "b"; void f() {} void x() { f(); b_f(); }`,
        b: `void f() { }`,
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void f() {

}

void f_0() {

}

void x() {
  f();
  f_0();
}`);
});

test("resolve namespace collision with local", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import * as b_ from "b"; void f() {} void x() { float f_0; f(); b_f(); }`,
        b: `void f() { }`,
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void f() {

}

void f_0() {

}

void x() {
  float f_0_0;
  f();
  f_0();
}`);
});

test("resolve 3x namespace collision", async () => {
  const tu = (
    await bundleShaders({
      entryPoint: "a",
      resolvePath: mapResolver({
        a: `import * as a_ from "b"; void x() { a_x(); }`,
        b: `import * as a_ from "c"; void x() { a_x(); }`,
        c: "void x() {}",
      }),
      mainFunctionName: "x",
    })
  ).unsafeExpectSuccess();
  const str = format.translationUnit(tu.code);

  expect(str).toEqual(`void x_1() {

}

void x_0() {
  x_1();
}

void x() {
  x_0();
}`);
});
