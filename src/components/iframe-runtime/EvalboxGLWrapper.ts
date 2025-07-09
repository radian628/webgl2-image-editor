import { ui } from "./EvalboxUIWrapper";
import { createGLMessageClient, range } from "./GLMessageClient";

const client = createGLMessageClient((msg) => {
  return new Promise((resolve, reject) => {
    const msgListener = (e: MessageEvent) => {
      if (e.data?.id === msg.id) {
        resolve(e.data);
        window.removeEventListener("message", msgListener);
      }
    };

    window.addEventListener("message", msgListener);
    window.parent.postMessage(msg, "*");
  });
});

declare global {
  interface Window {
    loopCancellers: (() => void)[];
    ui: typeof ui;
    range: typeof range;
  }
}

window.loopCancellers = [];

window.range = range;
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

window.ui = ui;
// @ts-expect-error
window.g = client;
