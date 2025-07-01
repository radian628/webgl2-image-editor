const vshader = await loadShader("root/test.vert", "vertex");

const fshader = await loadShader("root/test.frag", "fragment");

const buffer = await createBufferFromArray({
  array: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0],
  count: 2,
  encoding: "float",
  size: 32,
});

const tex = await create8BitRGBATexture(
  new Uint8Array([255, 0, 0, 0, 255, 255, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0]),
  2,
  2
);

const program = await linkProgram(vshader, fshader);

await draw(
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
