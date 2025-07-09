import { renderSimpleQuad } from "root/single-pass-renderer.ts";

await resize(512, 512);

const render = await renderSimpleQuad("root/julia.frag");

await resetVideoEncoder();

let t = 0;

let rendered = false;

loop(async () => {
  if (t <= 1000) {
    const angle = (t / 1000) * Math.PI * 2;
    const cx = Math.cos(angle) * 0.249 - 1;
    const cy = Math.sin(angle) * 0.249;

    await render({
      zoom: 1.0,
      center: [0.0, 0.0],
      iterations: 256,
      c: [cx, cy],
    });

    await addVideoFrame();

    t += 1;
  } else {
    if (!rendered) {
      rendered = true;
      await renderVideo("julia-set-anim.mp4");
    }
  }
});
