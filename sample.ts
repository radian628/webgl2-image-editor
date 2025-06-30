const vshader = await sendGLMessage({
  id: "1",
  contents: {
    type: "create-shader",
    id: "vs",
    source: {
      shaderType: "vertex",
      text: `#version 300 es\nprecision highp float;in vec2 pos;out vec2 pos2; void main() { pos2 = pos; gl_Position = vec4(pos, 0.5, 1.0); }`,
      uniforms: {},
      inputs: {
        pos: {
          type: "float",
          count: 2,
        },
      },
      outputs: {
        pos2: {
          type: "float",
          count: 2,
        },
      },
    },
  },
});

const fshader = await sendGLMessage({
  id: "2",
  contents: {
    type: "create-shader",
    id: "fs",
    source: {
      shaderType: "fragment",
      text: `#version 300 es\nprecision highp float;in vec2 pos2;out vec4 col; void main() { col = vec4(pos2, 0.0, 1.0); }`,
      uniforms: {},
      inputs: {
        pos2: {
          type: "float",
          count: 2,
        },
      },
      outputs: {
        col: {
          type: "float",
          count: 4,
        },
      },
    },
  },
});

const buffer = await createBufferFromArray({
  array: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0],
  count: 2,
  encoding: "float",
  size: 32,
});

// const program = await sendGLMessage({
//   id: "3",
//   contents: {
//     type: "create-program",
//     id: "prog",
//     vertex: vshader.content,
//     fragment: fshader.content,
//   },
// });

const program = await linkProgram(vshader.content, fshader.content);

await sendGLMessage({
  id: "4",
  contents: {
    type: "draw",
    inputs: {
      pos: { buffer, inputName: "attr" },
    },
    outputs: {
      col: null,
    },
    uniforms: {},
    program: program,
    count: 6,
  },
});

export {};
