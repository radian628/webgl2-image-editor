import { expect, test } from "bun:test";
import {
  parseGLSLFragmentWithoutPreprocessing,
  parseGLSLWithoutPreprocessing,
  parseWith,
  tryParseGLSLRaw,
} from "../glsl-analyzer/parser-combined";
import {
  external_declaration,
  parameter_declarator,
  translation_unit,
} from "../glsl-analyzer/parser";
import {
  assembleComposition,
  NodeTemplate,
  NodeTemplateComposition,
  NodeTemplateFunction,
  NodeTemplateInput,
  NodeTemplateOutput,
  ShaderGraphEdge,
  ShaderGraphNode,
} from "./shader-assembler";
import { table, Table, tableWithData } from "../utils/table";

const addFn = (id: number): NodeTemplateFunction => ({
  id,
  src: parseGLSLWithoutPreprocessing(
    `float add(float a, float b) { return a + b; }`
  ).unsafeExpectSuccess().translationUnit,
  fnName: "add",
});

function makeInputs(inputs: string[]): NodeTemplateInput[] {
  return [
    {
      id: 0,
      inputs: inputs.map((i) => ({
        declarator: parseWith(i, parameter_declarator),
      })),
    },
  ];
}

function makeOutputs(outputs: string[]): NodeTemplateOutput[] {
  return [
    {
      id: 0,
      outputs: outputs.map((i) => ({
        declarator: parseWith(i, parameter_declarator),
      })),
    },
  ];
}

type Template =
  | {
      type: "input";
      inputs: string[];
    }
  | {
      type: "output";
      outputs: string[];
    }
  | {
      type: "function";
      src: string;
      fnName: string;
    };

type GraphNode = {
  template: Template;
  inputs: Record<string, [GraphNode, string]>;
  id?: number;
};

function makeNodesAndEdges(data: GraphNode[]): {
  nodes: Table<ShaderGraphNode>;
  edges: Table<ShaderGraphEdge>;
  inputs: Table<NodeTemplateInput>;
  outputs: Table<NodeTemplateOutput>;
  functions: Table<NodeTemplateFunction>;
  templates: Table<NodeTemplate>;
  compositions: Table<NodeTemplateComposition>;
} {
  let edgeCount = 0;
  const templates2 = [...new Set(data.map((d) => d.template))];

  const inputs: NodeTemplateInput[] = [];
  const outputs: NodeTemplateOutput[] = [];
  const functions: NodeTemplateFunction[] = [];
  const templates: NodeTemplate[] = [];

  const templateToId = new Map<Template, number>(
    templates2.map((e, i) => [e, i])
  );

  for (let i = 0; i < templates2.length; i++) {
    const t = templates2[i];
    switch (t.type) {
      case "input":
        templates.push({
          id: templates.length,
          inputId: inputs.length,
        });
        inputs.push({
          id: inputs.length,
          inputs: t.inputs.map((i) => ({
            declarator: parseWith(i, parameter_declarator),
          })),
        });
        break;
      case "output":
        templates.push({
          id: templates.length,
          outputId: outputs.length,
        });
        outputs.push({
          id: outputs.length,
          outputs: t.outputs.map((i) => ({
            declarator: parseWith(i, parameter_declarator),
          })),
        });
        break;
      case "function":
        templates.push({
          id: templates.length,
          functionId: functions.length,
        });
        functions.push({
          id: functions.length,
          src: parseGLSLWithoutPreprocessing(t.src).unsafeExpectSuccess()
            .translationUnit,
          fnName: t.fnName,
        });
        break;
    }
  }

  return {
    inputs: tableWithData(inputs),
    outputs: tableWithData(outputs),
    functions: tableWithData(functions),
    templates: tableWithData(templates),
    nodes: tableWithData(
      data.map(
        (d, i) => (
          (d.id = i),
          {
            id: i,
            templateId: templateToId.get(d.template)!,
          }
        )
      )
    ),
    edges: tableWithData(
      data.flatMap((d, i) =>
        Object.entries(d.inputs).map(([k, v]) => ({
          sourceId: v[0].id!,
          sourceInput: v[1],
          targetId: i,
          targetInput: k,
          id: edgeCount++,
        }))
      )
    ),
    compositions: tableWithData<NodeTemplateComposition>([]),
  };
}

test("repeated inputs", () => {
  const inputs: Template = { type: "input", inputs: ["float in1"] };
  const outputs: Template = { type: "output", outputs: ["float out1"] };
  const add: Template = {
    type: "function",
    src: `float add(float a, float b) { return a + b; }`,
    fnName: "add",
  };

  const inputNode = { template: inputs, inputs: {} };

  const addNode: GraphNode = {
    template: add,
    inputs: { a: [inputNode, "in1"], b: [inputNode, "in1"] },
  };

  const outputNode: GraphNode = {
    template: outputs,
    inputs: { out1: [addNode, "return value"] },
  };

  const composition = assembleComposition({
    ...makeNodesAndEdges([inputNode, addNode, outputNode]),
    fnName: "test",
  }).unsafeExpectSuccess();

  expect(composition).toBe(`float add(float a, float b) {
  return a + b;
}

void test(in float in1, out float out1) {
  float _0 = in1;
  float _1 = in1;
  float _2 = add(_0, _1);
  out1 = _2;
}`);
});

test("repeated outputs", () => {
  const inputs: Template = { type: "input", inputs: ["float in1"] };
  const square: Template = {
    type: "function",
    src: `float square(float x) { return x * x; }`,
    fnName: "square",
  };
  const outputs: Template = {
    type: "output",
    outputs: ["float out1", "float out2"],
  };

  const inputNode = { template: inputs, inputs: {} };

  const squareNode: GraphNode = {
    template: square,
    inputs: {
      x: [inputNode, "in1"],
    },
  };

  const outputNode: GraphNode = {
    template: outputs,
    inputs: {
      out1: [squareNode, "return value"],
      out2: [squareNode, "return value"],
    },
  };

  const composition = assembleComposition({
    ...makeNodesAndEdges([inputNode, squareNode, outputNode]),
    fnName: "test",
  }).unsafeExpectSuccess();

  expect(composition).toBe(`float square(float x) {
  return x * x;
}

void test(in float in1, out float out1, out float out2) {
  float _0 = in1;
  float _1 = square(_0);
  out1 = _1;
  out2 = _1;
}`);
});

test("simple assemble composition", () => {
  const inputs: Template = {
    type: "input",
    inputs: ["float in1", "float in2"],
  };
  const outputs: Template = { type: "output", outputs: ["float out1"] };
  const add: Template = {
    type: "function",
    src: `float add(float a, float b) { return a + b; }`,
    fnName: "add",
  };
  const square: Template = {
    type: "function",
    src: `float square(float x) { return x * x; }`,
    fnName: "square",
  };

  const inputNode = { template: inputs, inputs: {} };

  const squareNode1: GraphNode = {
    template: square,
    inputs: { x: [inputNode, "in1"] },
  };
  const squareNode2: GraphNode = {
    template: square,
    inputs: { x: [inputNode, "in2"] },
  };

  const addNode: GraphNode = {
    template: add,
    inputs: {
      a: [squareNode1, "return value"],
      b: [squareNode2, "return value"],
    },
  };

  const outputNode: GraphNode = {
    template: outputs,
    inputs: { out1: [addNode, "return value"] },
  };

  const composition = assembleComposition({
    ...makeNodesAndEdges([
      inputNode,
      squareNode1,
      squareNode2,
      addNode,
      outputNode,
    ]),
    fnName: "distSquared",
  }).unsafeExpectSuccess();

  expect(composition).toBe(`float square(float x) {
  return x * x;
}

float add(float a, float b) {
  return a + b;
}

void distSquared(in float in1, in float in2, out float out1) {
  float _0 = in1;
  float _1 = in2;
  float _2 = square(_0);
  float _3 = square(_1);
  float _4 = add(_2, _3);
  out1 = _4;
}`);
});
