import { renderSimpleQuad } from "root/single-pass-renderer.ts";

await g.resize(512, 512);

const render = await renderSimpleQuad("root/zoomable-mandelbrot.frag");

await g.resetVideoEncoder();

let t = 0;

let rendered = false;

loop(async () => {
  if (t <= 1) {
    await render({
      zoom: 3.0 - t,
      center: [0.0, 0.0],
      iterations: 256,
    });

    await g.addVideoFrame();

    t += 0.01;
  } else {
    if (!rendered) {
      rendered = true;
      await g.renderVideo();
    }
  }
});
