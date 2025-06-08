import { expect, test } from "bun:test";
import {
  expression,
  fuzz,
  glslFuzzer,
  glslIntFuzzer,
  integer_constant,
  primary_expression,
} from "./fuzz";

// test("fuzz example", () => {
//   for (let i = 0; i < 10; i++) {
//     console.log(fuzz(glslFuzzer, Math.random, 3, primary_expression));
//   }
// });
