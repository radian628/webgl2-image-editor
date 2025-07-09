import { renderSimpleQuad } from "root/single-pass-renderer.ts";

await g.resize(512, 512);

const render = await renderSimpleQuad("root/zoomable-mandelbrot.frag");

const menu = await g.createMenu(
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

function makeIntervalLogger() {
  let time = performance.now();
  return {
    record(name: string) {
      const timeTemp = performance.now();
      console.log(name, timeTemp - time);
      time = timeTemp;
    },
  };
}

loop(async () => {
  const perf = makeIntervalLogger();
  const params = await g.pollMenu(menu);

  const bounds = await g.getPanAndZoomBounds();

  await render({
    zoom: bounds.dimensions[0] * 0.5,
    center: bounds.center,
    iterations: params.Iterations,
  });
});
