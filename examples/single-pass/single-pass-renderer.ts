const simpleQuadBuffer = await g.createBufferFromArray({
  array: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0],
  count: 2,
  encoding: "float",
  size: 32,
});

type ValidFragmentShader = {
  [Key in keyof LoadShaderOverloadMap]: LoadShaderOverloadMap[Key] extends {
    inputs: { pos: { type: "float"; count: 2 } };
    outputs: { col: { type: "float"; count: 4 } };
  }
    ? Key
    : never;
}[keyof LoadShaderOverloadMap];

type Test1 = Awaited<ReturnType<typeof loadShader>>;

export async function renderSimpleQuad<FS extends ValidFragmentShader>(
  fragmentShaderLink: FS
) {
  const vshader = await g.loadShader("root/blit.vert", "vertex");
  const fshader = await g.loadShader(fragmentShaderLink, "fragment");

  const prog = await g.linkProgram(vshader, fshader);

  return async (
    uniforms: UniformsToValues<LoadShaderOverloadMap[FS]["uniforms"]>
  ) => {
    await g.draw(
      // @ts-expect-error
      prog,
      6,
      {
        in_pos: { buffer: simpleQuadBuffer, inputName: "attr" },
      },
      {
        col: null,
      },
      uniforms
    );
  };
}
