import { renderSimpleQuad } from "root/single-pass-renderer.ts";

await resize(512, 512);

const render = await renderSimpleQuad("root/zoomable-mandelbrot.frag");

const menu = await createMenu(
  ui.menu(
    "Options",
    {
      Zoom: ui.float(0.5),
      Center: ui.vec2([0.0, 0.0]),
      Iterations: ui.int(256),
    },
    ""
  )
);

loop(async () => {
  const params = await pollMenu(menu);

  await render({
    zoom: params.Zoom,
    center: params.Center,
    iterations: params.Iterations,
  });
});
