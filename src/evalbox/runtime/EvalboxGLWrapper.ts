import { ui } from "./EvalboxUIWrapper";
import { createGLMessageClient, range } from "./GLMessageClient";
import { workerifyClient } from "../../utilities/workerify/workerify";
import { createGLMessageExecutor } from "../../gl-message/server/GLMessageServer";

// const client = createGLMessageClient((msg) => {
//   return new Promise((resolve, reject) => {
//     const msgListener = (e: MessageEvent) => {
//       if (e.data?.id === msg.id) {
//         resolve(e.data);
//         window.removeEventListener("message", msgListener);
//       }
//     };

//     window.addEventListener("message", msgListener);
//     window.parent.postMessage(msg, "*");
//   });
// });

const client = createGLMessageClient(
  workerifyClient<ReturnType<typeof createGLMessageExecutor>>(
    "glm",
    (cb) => {
      window.addEventListener("message", (e) => cb(e.data));
      return () => {};
    },
    (req) => {
      window.parent.postMessage(req, "*");
    }
  )
);

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
