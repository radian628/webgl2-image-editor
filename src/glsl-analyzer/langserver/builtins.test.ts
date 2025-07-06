import { test } from "bun:test";
import { builtinSource, getGLSLBuiltins } from "./builtins";

test("make sure builtins compile without errors", () => {
  console.log(builtinSource.match(/\n/g)?.length);
  const builtins = getGLSLBuiltins(0, 0, []);
});
