const rectVert = await g.loadShader("root/rect.vert", "vertex");

const rectFrag = await g.loadShader("root/rect.frag", "fragment");

const prog = await g.linkProgram(rectVert, rectFrag);

const squareBuffer = await g.createBufferFromArray({
  array: [0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0],
  count: 2,
  encoding: "float",
  size: 32,
});

export async function rect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: [number, number, number, number]
) {
  await g.draw(
    prog,
    6,
    {
      pos: { buffer: squareBuffer, inputName: "attr" },
    },
    {
      col: null,
    },
    {
      color,
      bottom_left: [x1, y1],
      top_right: [x2, y2],
    }
  );
}
