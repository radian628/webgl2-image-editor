const vshader = await g.loadShader("root/test.vert", "vertex");

const fshader = await g.loadShader("root/test.frag", "fragment");

const buffer = await g.createBufferFromArray({
  array: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0],
  count: 2,
  encoding: "float",
  size: 32,
});

const tex = await g.create8BitRGBATexture(
  new Uint8Array([255, 0, 0, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0]),
  2,
  2
);

const program = await g.linkProgram(vshader, fshader);

await g.draw(
  program,
  6,
  {
    pos: { buffer, inputName: "attr" },
  },
  {
    col: null,
  },
  {
    blue: 0.5,
    tex,
  }
);

export {};
