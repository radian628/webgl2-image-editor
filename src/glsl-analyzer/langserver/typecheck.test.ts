import { test, expect } from "bun:test";
import { parseGLSLWithoutPreprocessing } from "../parser-combined";

test("yeah", () => {
  const tu = parseGLSLWithoutPreprocessing(
    "void main() { a.b.c; }"
  ).unsafeExpectSuccess().translationUnit;
  console.log(JSON.stringify(tu, null, 2));
});
