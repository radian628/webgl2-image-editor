const vshader = await loadShader("root/test.vert", "vertex");

const fshader = await loadShader("root/test.frag", "fragment");

const circleshader = await loadShader("root/circle.frag", "fragment");

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

const rendertex = await create8BitRGBATexture(undefined, 256, 256);

const texprogram = await linkProgram(vshader, fshader);
const circleprogram = await linkProgram(vshader, circleshader);

await draw(
  circleprogram,
  6,
  {
    pos: { buffer, inputName: "attr" },
  },
  {
    col: rendertex,
  },
  {}
);

await draw(
  texprogram,
  6,
  {
    pos: { buffer, inputName: "attr" },
  },
  {
    col: null,
  },
  {
    blue: 0.5,
    tex: rendertex,
  }
);

export {};
