import { createGLMessageClient } from "./GLMessageClient";

const client = createGLMessageClient((msg) => {
  return new Promise((resolve, reject) => {
    window.addEventListener("message", (e) => {
      if (e.data?.id === msg.id) {
        resolve(e.data);
      }
    });
    window.parent.postMessage(msg, "*");
  });
});

declare global {
  interface Window {
    loopCancellers: (() => void)[];
  }
}

window.loopCancellers = [];

window.loop = function (callback: (time: number) => void) {
  let stop = false;
  function inner(time: number) {
    callback(time);
    if (!stop) {
      window.requestAnimationFrame(inner);
    }
  }
  window.requestAnimationFrame(inner);
  const cancel = () => (stop = true);
  window.loopCancellers.push(cancel);
  return cancel;
};

for (const [k, v] of Object.entries(client)) {
  // @ts-expect-error
  window[k] = v;
}
