import { expect, test } from "bun:test";
import { createShaderFromFunctionGraph } from "./shader-assembler";
import {
  parseGLSLFragmentWithoutPreprocessing,
  tryParseGLSLRaw,
} from "../glsl-analyzer/parser-combined";
import {
  external_declaration,
  translation_unit,
} from "../glsl-analyzer/parser";

test("assemble shader 1", () => {
  const shader = createShaderFromFunctionGraph(
    [
      {
        id: 0,
        src: parseGLSLFragmentWithoutPreprocessing(
          "in vec2 texcoord;",
          external_declaration
        ).unsafeExpectSuccess(),
      },
    ],
    [
      {
        id: 1,
        src: parseGLSLFragmentWithoutPreprocessing(
          "out vec4 fragColor;",
          external_declaration
        ).unsafeExpectSuccess(),
        from: 2,
        fromParam: "return value",
      },
    ],
    [
      {
        id: 2,
        src: parseGLSLFragmentWithoutPreprocessing(
          "vec4 main_image(vec2 tex_coord) { fragColor = vec4(tex_coord, 0.0, 1.0); }",
          translation_unit
        ).unsafeExpectSuccess(),
        functionName: "main_image",
        incoming: [
          {
            from: 0,
            fromParam: "texcoord",
            toParam: "tex_coord",
          },
        ],
      },
    ]
  ).unsafeExpectSuccess();

  expect(shader).toEqual(
    `#version 300 es
precision highp float;
in vec2 texcoord;out vec4 fragColor` +
      `vec4 main_image(vec2 tex_coord){fragColor=vec4(tex_coord,0.0,1.0);}` +
      `void main(){vec4 _1=main_image(texcoord);fragColor=_1;}`
  );
});
