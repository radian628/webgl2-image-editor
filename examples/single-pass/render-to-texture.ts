const vshader = await g.loadShader("root/test.vert", "vertex");

const fshader = await g.loadShader("root/test.frag", "fragment");

const circleshader = await g.loadShader("root/circle.frag", "fragment");

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

const rendertex = await g.create8BitRGBATexture(undefined, 256, 256);

const texprogram = await g.linkProgram(vshader, fshader);
const circleprogram = await g.linkProgram(vshader, circleshader);

const menu = await g.createMenu({
  type: "number",
  count: 1,
  defaultValue: 0.5,
});

loop(async () => {
  const menuValue = await g.pollMenu(menu);
  await g.draw(
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

  await g.draw(
    texprogram,
    6,
    {
      pos: { buffer, inputName: "attr" },
    },
    {
      col: null,
    },
    {
      blue: menuValue,
      tex: rendertex,
    }
  );
});

export {};
